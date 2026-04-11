"""
Authentication endpoints — signup, login, me, logout.

Security measures:
- Argon2 password hashing
- Brute-force protection (account lock after 5 failed attempts for 15 minutes)
- Audit logging for all auth events
- JWT tokens with configurable expiry
"""
import hmac
import uuid
import random
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from jose import jwt

from app.api.deps import get_db, get_current_user, security_scheme
from app.core.config import settings
from app.models.otp_verification import OtpVerification, OtpPurpose
from app.schemas.otp import OtpVerifyRequest, OtpResendRequest, OtpResponse
from app.services.email import send_verification_email, send_welcome_email
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_otp_hash,
)
from app.models.user import User, UserRole
from app.models.organization_member import OrganizationMember
from app.models.user_audit_log import UserAuditLog
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
)

router = APIRouter()

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
OTP_EXPIRY_MINUTES = 10
OTP_WINDOW_MINUTES = 15
MAX_OTP_REQUESTS_PER_WINDOW = 3


def _generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


async def _send_verification_email(email: str, otp: str) -> None:
    """
    Send verification email using the Resend service.
    """
    print(f"[EmailService] Attempting to send OTP to {email}...")
    await send_verification_email(email, otp)
    print(f"[EmailService] Successfully sent OTP to {email}")


async def _send_welcome_email(email: str, name: str) -> None:
    """
    Send welcome email using the Resend service.
    """
    print(f"[EmailService] Attempting to send welcome email to {email}...")
    await send_welcome_email(email, name)
    print(f"[EmailService] Successfully sent welcome email to {email}")


def _get_or_create_otp(db: Session, user_id: str, purpose: OtpPurpose, ip: str | None = None) -> str:
    """
    Check rate limits, then generate and store a new OTP.
    Ensures only one active OTP exists per user per purpose.
    """
    now = datetime.now(timezone.utc)
    
    # Check for existing OTP to enforce rate limits
    otp_row = db.query(OtpVerification).filter(
        OtpVerification.userId == user_id,
        OtpVerification.purpose == purpose
    ).first()

    if otp_row:
        # Check window for request-rate limiting
        window_end = otp_row.windowStart + timedelta(minutes=OTP_WINDOW_MINUTES)
        if now < window_end:
            if otp_row.requestCount >= MAX_OTP_REQUESTS_PER_WINDOW:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many verification requests. Please try again in {int((window_end - now).total_seconds() / 60) + 1} minutes."
                )
            otp_row.requestCount += 1
        else:
            # Window expired, reset window and count
            otp_row.windowStart = now
            otp_row.requestCount = 1
    
    # Generate new OTP
    otp = _generate_otp()
    otp_hash = get_otp_hash(otp)
    
    if otp_row:
        # Update existing row
        otp_row.otpHash = otp_hash
        otp_row.expiresAt = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
        otp_row.attempts = 0
        otp_row.isUsed = False
        otp_row.ipAddress = ip
    else:
        # Create new row
        otp_row = OtpVerification(
            id=_generate_cuid(),
            userId=user_id,
            purpose=purpose,
            otpHash=otp_hash,
            expiresAt = now + timedelta(minutes=OTP_EXPIRY_MINUTES),
            ipAddress=ip,
            windowStart=now,
            requestCount=1
        )
        db.add(otp_row)
    
    db.commit()
    return otp


def _generate_cuid() -> str:
    """Generate a cuid-like ID compatible with Prisma's cuid() default."""
    return f"c{uuid.uuid4().hex[:24]}"


def _log_audit(
    db: Session,
    action: str,
    user_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: dict | None = None,
) -> None:
    """Write an audit log entry."""
    log = UserAuditLog(
        id=_generate_cuid(),
        userId=user_id,
        action=action,
        metadata_=metadata,
        ipAddress=ip_address,
        userAgent=user_agent,
    )
    db.add(log)
    db.commit()


def _get_user_organization_id(db: Session, user_id: str) -> str | None:
    """Helper to find the primary/active organization ID for a user."""
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.userId == user_id,
        OrganizationMember.isActive == True
    ).first()
    return membership.organizationId if membership else None


def _build_auth_response(user: User, token: str, db: Session) -> AuthResponse:
    """Build a standardized auth response with token and user data."""
    org_id = _get_user_organization_id(db, user.id)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            emailVerified=user.emailVerified,
            image=user.image,
            role=user.role.value if user.role else "USER",
            organizationId=org_id,
            isActive=user.isActive,
            lastLoginAt=user.lastLoginAt,
            createdAt=user.createdAt,
        ),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Register a new user with email and password.
    Returns JWT token + user data on success.
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user
    user = User(
        id=_generate_cuid(),
        name=payload.name,
        email=payload.email,
        password=get_password_hash(payload.password),
        role=UserRole.USER,
        isActive=True,
        lastLoginAt=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    _log_audit(
        db,
        action="SIGNUP",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        metadata={"email": user.email},
    )

    # Generate and "send" OTP
    otp = _get_or_create_otp(db, user.id, OtpPurpose.EMAIL_VERIFICATION, request.client.host if request.client else None)
    await _send_verification_email(user.email, otp)
    
    # Send welcome email
    await _send_welcome_email(user.email, user.name)

    # Generate token
    token = create_access_token(subject=user.id, extra_claims={"tv": user.tokenVersion})

    return _build_auth_response(user, token, db)


@router.post("/verify-email", response_model=OtpResponse)
def verify_email_otp(
    payload: OtpVerifyRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Verify email with a 6-digit OTP."""
    # Since user is not logged in, we must have email in payload or we can't find them
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required for verification")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.emailVerified:
        return OtpResponse(message="Email already verified", success=True)

    # Fetch active OTP for this user
    otp_row = db.query(OtpVerification).filter(
        OtpVerification.userId == user.id,
        OtpVerification.purpose == OtpPurpose.EMAIL_VERIFICATION
    ).first()

    if not otp_row:
        raise HTTPException(status_code=404, detail="No active verification code found")

    # Check expiration
    now = datetime.now(timezone.utc)
    if now > otp_row.expiresAt:
        _log_audit(
            db,
            action="OTP_EXPIRED",
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"purpose": otp_row.purpose, "expired_at": str(otp_row.expiresAt)}
        )
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")

    # Check attempts
    if otp_row.attempts >= otp_row.maxAttempts:
        # Max out the request count to force them to wait for the rate-limit window
        otp_row.requestCount = MAX_OTP_REQUESTS_PER_WINDOW
        db.commit()
        
        _log_audit(
            db,
            action="OTP_MAX_ATTEMPTS_REACHED",
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"purpose": "EMAIL_VERIFICATION"}
        )
        # Calculate remaining time for the message
        window_end = otp_row.windowStart + timedelta(minutes=OTP_WINDOW_MINUTES)
        remaining_minutes = max(1, int((window_end - now).total_seconds() / 60) + 1)
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
            detail=f"Too many failed attempts. Please try again in {remaining_minutes} minutes."
        )

    # Verify hash
    submitted_hash = get_otp_hash(payload.code)
    print(f"[OTP Debug] Verifying user {user.email}")
    print(f"[OTP Debug] Submitted: {payload.code} -> {submitted_hash}")
    print(f"[OTP Debug] Stored Hash: {otp_row.otpHash}")
    
    if not hmac.compare_digest(submitted_hash, otp_row.otpHash):
        otp_row.attempts += 1
        db.commit()
        
        print(f"[OTP Debug] Verification FAILED. Attempt {otp_row.attempts}/{otp_row.maxAttempts}")
        
        _log_audit(
            db,
            action="OTP_VERIFY_FAILED",
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"purpose": otp_row.purpose, "attempts": otp_row.attempts}
        )
        remaining = otp_row.maxAttempts - otp_row.attempts
        detail = "Invalid verification code. Please try again."
            
        raise HTTPException(status_code=400, detail=detail)

    # Success!
    print(f"[OTP Debug] Verification SUCCESS for {user.email}")
    user.emailVerified = datetime.now(timezone.utc)
    db.delete(otp_row)  # Consume the OTP
    db.commit()

    _log_audit(
        db,
        action="EMAIL_VERIFIED",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return OtpResponse(message="Email verified successfully", success=True)


@router.post("/resend-verification", response_model=OtpResponse)
async def resend_verification_otp(
    payload: OtpResendRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Regenerate and resend the verification code."""
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.emailVerified:
        return OtpResponse(message="Email already verified", success=True)

    # _get_or_create_otp handles the rate limiting logic internally
    otp = _get_or_create_otp(db, user.id, OtpPurpose.EMAIL_VERIFICATION, request.client.host if request.client else None)
    await _send_verification_email(user.email, otp)

    _log_audit(
        db,
        action="OTP_RESENT",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        metadata={"purpose": "EMAIL_VERIFICATION"}
    )

    return OtpResponse(message="Verification code resent", success=True)


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password.
    Implements brute-force protection with account locking.
    Automatically triggers email verification if account is unverified.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Generic error to prevent email enumeration
    bad_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )

    if not user:
        raise bad_credentials

    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact your administrator.",
        )

    # Check if account is locked
    if user.lockedUntil:
        if datetime.now(timezone.utc) < user.lockedUntil:
            remaining = int((user.lockedUntil - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account is temporarily locked. Try again in {remaining} minutes.",
            )
        else:
            # Lock expired, reset
            user.lockedUntil = None
            user.failedLoginAttempts = 0

    # Check if user has a password (might be OAuth-only user)
    if not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses social login. Please sign in with Google.",
        )

    # Verify password
    if not verify_password(payload.password, user.password):
        # Increment failed attempts
        attempts = (user.failedLoginAttempts or 0) + 1
        user.failedLoginAttempts = attempts

        if attempts >= MAX_FAILED_ATTEMPTS:
            user.lockedUntil = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            user.tokenVersion += 1
            db.commit()

            _log_audit(
                db,
                action="ACCOUNT_LOCKED",
                user_id=user.id,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                metadata={"reason": "max_failed_attempts", "attempts": attempts},
            )

            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account locked for {LOCKOUT_DURATION_MINUTES} minutes due to too many failed attempts.",
            )

        db.commit()

        _log_audit(
            db,
            action="LOGIN_FAILED",
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"attempts": attempts},
        )

        raise bad_credentials

    # Success — reset failed attempts and update last login
    user.failedLoginAttempts = 0
    user.lockedUntil = None
    user.lastLoginAt = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    # Audit log
    _log_audit(
        db,
        action="LOGIN_SUCCESS",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    # If user is not verified, trigger a verification email
    if not user.emailVerified:
        otp = _get_or_create_otp(db, user.id, OtpPurpose.EMAIL_VERIFICATION, request.client.host if request.client else None)
        await _send_verification_email(user.email, otp)

    # Generate token
    token = create_access_token(subject=user.id, extra_claims={"tv": user.tokenVersion})

    return _build_auth_response(user, token, db)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current authenticated user's profile."""
    org_id = _get_user_organization_id(db, current_user.id)
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        emailVerified=current_user.emailVerified,
        image=current_user.image,
        role=current_user.role.value if current_user.role else "USER",
        organizationId=org_id,
        isActive=current_user.isActive,
        lastLoginAt=current_user.lastLoginAt,
        createdAt=current_user.createdAt,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Logout endpoint. Since we use stateless JWTs inside Tauri (session-ending on close),
    actual token clearing happens client-side without needing DB-level JTI scraping.
    """

    _log_audit(
        db,
        action="LOGOUT",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return MessageResponse(message="Logged out successfully")

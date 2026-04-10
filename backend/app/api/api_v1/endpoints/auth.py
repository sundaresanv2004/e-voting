"""
Authentication endpoints — signup, login, me, logout.

Security measures:
- Argon2 password hashing
- Brute-force protection (account lock after 5 failed attempts for 15 minutes)
- Audit logging for all auth events
- JWT tokens with configurable expiry
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, security_scheme
from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.models.user import User, UserRole
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


def _build_auth_response(user: User, token: str) -> AuthResponse:
    """Build a standardized auth response with token and user data."""
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
            isActive=user.isActive,
            lastLoginAt=user.lastLoginAt,
            createdAt=user.createdAt,
        ),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(
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

    # Generate token
    token = create_access_token(subject=user.id, extra_claims={"tv": user.tokenVersion})

    return _build_auth_response(user, token)


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password.
    Implements brute-force protection with account locking.
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

    # Generate token
    token = create_access_token(subject=user.id, extra_claims={"tv": user.tokenVersion})

    return _build_auth_response(user, token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        emailVerified=current_user.emailVerified,
        image=current_user.image,
        role=current_user.role.value if current_user.role else "USER",
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

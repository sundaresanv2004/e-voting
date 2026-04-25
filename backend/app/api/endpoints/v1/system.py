from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app.core.security import generate_secret_token, hash_secret_token
from app.db.session import get_db
from app.models.organization import Organization
from app.models.organization_settings import OrganizationSettings
from app.models.system import AuthorizedSystem, SystemStatus
from app.models.system_log import SystemAuditLog, AuditStatus
from app.schemas.system import (
    SystemActivateRequest,
    SystemActivateResponse,
    SystemClaimRequest,
    SystemConnectRequest,
    SystemConnectResponse,
    SystemLogoutRequest,
    SystemStatusRequest,
    SystemStatusResponse,
    SystemVerifyRequest,
    SystemVerifyResponse,
)
from app.services.mail.service import mail_service
import datetime
import uuid

router = APIRouter()


def claim_token_matches(system: AuthorizedSystem, claim_token: str) -> bool:
    return bool(system.claimTokenHash and system.claimTokenHash == hash_secret_token(claim_token))


def session_token_matches(system: AuthorizedSystem, secret_token: str) -> bool:
    return bool(system.secretTokenHash and system.secretTokenHash == hash_secret_token(secret_token))


@router.post("/connect", response_model=SystemConnectResponse)
def connect_system(request: SystemConnectRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    org = (
        db.query(Organization)
        .options(joinedload(Organization.owner))
        .filter(Organization.code == request.organizationCode)
        .first()
    )

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or invalid security code.",
        )

    settings = (
        db.query(OrganizationSettings)
        .filter(OrganizationSettings.organizationId == org.id)
        .first()
    )

    if not settings or not settings.allowSystemConnection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System connection is disabled for this organization.",
        )

    claim_token = generate_secret_token()
    claim_token_hash = hash_secret_token(claim_token)
    existing_org_system = None

    if request.macAddress:
        all_systems_with_mac = (
            db.query(AuthorizedSystem)
            .filter(AuthorizedSystem.macAddress == request.macAddress)
            .all()
        )

        for system in all_systems_with_mac:
            if system.organizationId == org.id:
                existing_org_system = system
                old_status = system.status

                system.status = SystemStatus.PENDING
                system.name = request.systemName
                system.hostName = request.hostName
                system.ipAddress = request.ipAddress
                system.claimTokenHash = claim_token_hash
                system.secretTokenHash = None
                system.tokenExpiresAt = None
                system.updatedAt = datetime.datetime.utcnow()

                event_name = (
                    "CONNECTION_RETRIED_AFTER_REJECTION"
                    if old_status == SystemStatus.REJECTED
                    else "CONNECTION_RESUMED"
                )

                db.add(
                    SystemAuditLog(
                        id=str(uuid.uuid4()),
                        systemId=system.id,
                        action=event_name,
                        status=AuditStatus.INFO,
                        ipAddress=request.ipAddress,
                        metadata_={
                            "hostname": request.hostName,
                            "orgCode": request.organizationCode,
                            "previous_status": old_status.value
                            if hasattr(old_status, "value")
                            else str(old_status),
                        },
                    )
                )
            elif system.status in [SystemStatus.APPROVED, SystemStatus.PENDING]:
                system.status = SystemStatus.SUSPENDED
                system.secretTokenHash = None
                system.tokenExpiresAt = None
                system.updatedAt = datetime.datetime.utcnow()

                db.add(
                    SystemAuditLog(
                        id=str(uuid.uuid4()),
                        systemId=system.id,
                        action="SYSTEM_SUSPENDED_MIGRATION",
                        status=AuditStatus.WARNING,
                        metadata_={"reason": "Hardware moved to new organization", "new_org": org.name},
                    )
                )

        if existing_org_system:
            db.commit()

            if org.owner and org.owner.email:
                background_tasks.add_task(
                    mail_service.send_system_registration_email,
                    to_email=org.owner.email,
                    admin_name=org.owner.name,
                    system_name=request.systemName,
                    host_name=request.hostName,
                    ip_address=request.ipAddress,
                    org_name=org.name,
                )

            return SystemConnectResponse(
                success=True,
                message="System connection resumed and pending re-approval.",
                systemId=existing_org_system.id,
                organizationName=org.name,
                claimToken=claim_token,
            )

    current_system_count = (
        db.query(AuthorizedSystem)
        .filter(
            AuthorizedSystem.organizationId == org.id,
            AuthorizedSystem.status != SystemStatus.REJECTED,
            AuthorizedSystem.status != SystemStatus.REVOKED,
            AuthorizedSystem.status != SystemStatus.SUSPENDED,
        )
        .count()
    )

    if current_system_count >= settings.maxSystems:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Organization has reached its maximum limit of {settings.maxSystems} connected systems.",
        )

    new_system_id = str(uuid.uuid4())
    new_system = AuthorizedSystem(
        id=new_system_id,
        organizationId=org.id,
        name=request.systemName,
        macAddress=request.macAddress,
        hostName=request.hostName,
        ipAddress=request.ipAddress,
        claimTokenHash=claim_token_hash,
        status=SystemStatus.PENDING,
        createdAt=datetime.datetime.utcnow(),
        updatedAt=datetime.datetime.utcnow(),
    )

    db.add(new_system)
    db.flush()

    db.add(
        SystemAuditLog(
            id=str(uuid.uuid4()),
            systemId=new_system_id,
            action="CONNECTION_REQUESTED",
            status=AuditStatus.INFO,
            ipAddress=request.ipAddress,
            metadata_={"hostname": request.hostName},
        )
    )

    db.commit()
    db.refresh(new_system)

    if org.owner and org.owner.email:
        background_tasks.add_task(
            mail_service.send_system_registration_email,
            to_email=org.owner.email,
            admin_name=org.owner.name,
            system_name=request.systemName,
            host_name=request.hostName,
            ip_address=request.ipAddress,
            org_name=org.name,
        )

    return SystemConnectResponse(
        success=True,
        message="System connection requested successfully. Pending admin approval.",
        systemId=new_system.id,
        organizationName=org.name,
        claimToken=claim_token,
    )


@router.post("/status", response_model=SystemStatusResponse)
def get_system_status(request: SystemStatusRequest, db: Session = Depends(get_db)):
    system = (
        db.query(AuthorizedSystem)
        .options(joinedload(AuthorizedSystem.organization))
        .filter(AuthorizedSystem.id == request.systemId)
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found.",
        )

    if not claim_token_matches(system, request.claimToken):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Terminal claim token is invalid.",
        )

    return SystemStatusResponse(
        status=system.status.value,
        message="Current system status retrieved.",
        systemName=system.name
        if system.status in [SystemStatus.APPROVED, SystemStatus.EXPIRED, SystemStatus.REVOKED, SystemStatus.SUSPENDED]
        else None,
        organizationName=system.organization.name
        if system.status in [SystemStatus.APPROVED, SystemStatus.EXPIRED, SystemStatus.REVOKED, SystemStatus.SUSPENDED]
        else None,
        organizationLogo=system.organization.logo
        if system.status in [SystemStatus.APPROVED, SystemStatus.EXPIRED, SystemStatus.REVOKED, SystemStatus.SUSPENDED]
        else None,
        tokenExpiresAt=system.tokenExpiresAt.isoformat() if system.tokenExpiresAt else None,
        activationReady=system.status == SystemStatus.APPROVED and bool(system.secretTokenHash),
    )


@router.post("/activate", response_model=SystemActivateResponse)
def activate_system(request: SystemActivateRequest, db: Session = Depends(get_db)):
    system = (
        db.query(AuthorizedSystem)
        .options(joinedload(AuthorizedSystem.organization))
        .filter(AuthorizedSystem.id == request.systemId)
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found.",
        )

    if not claim_token_matches(system, request.claimToken):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Terminal claim token is invalid.",
        )

    if request.macAddress and system.macAddress and request.macAddress != system.macAddress:
        return SystemActivateResponse(
            success=False,
            status="MAC_MISMATCH",
            message="Hardware mismatch detected.",
        )

    if system.status == SystemStatus.EXPIRED:
        return SystemActivateResponse(
            success=False,
            status="EXPIRED",
            message="Security token has expired.",
        )

    if system.status != SystemStatus.APPROVED:
        return SystemActivateResponse(
            success=False,
            status=system.status.value,
            message=f"Terminal status is {system.status.value}.",
        )

    raw_session_token = generate_secret_token()
    system.secretTokenHash = hash_secret_token(raw_session_token)
    system.updatedAt = datetime.datetime.utcnow()

    db.add(
        SystemAuditLog(
            id=str(uuid.uuid4()),
            systemId=system.id,
            action="ACTIVATION_TOKEN_ISSUED",
            status=AuditStatus.INFO,
            metadata_={"mac": request.macAddress},
        )
    )
    db.commit()

    return SystemActivateResponse(
        success=True,
        status="APPROVED",
        message="Terminal activated successfully.",
        secretToken=raw_session_token,
        systemName=system.name,
        organizationName=system.organization.name,
        organizationLogo=system.organization.logo,
        tokenExpiresAt=system.tokenExpiresAt.isoformat() if system.tokenExpiresAt else None,
    )


@router.post("/verify", response_model=SystemVerifyResponse)
def verify_system(
    request: SystemVerifyRequest,
    fastapi_request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if not request.secretToken:
        system_check = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == request.systemId).first()
        if system_check:
            return SystemVerifyResponse(
                valid=False,
                status=system_check.status.value,
                message="No token provided. Terminal not yet approved.",
            )
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    system = (
        db.query(AuthorizedSystem)
        .options(joinedload(AuthorizedSystem.organization).joinedload(Organization.owner))
        .filter(AuthorizedSystem.id == request.systemId)
        .first()
    )

    if not system:
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    if not session_token_matches(system, request.secretToken):
        rotated_status = "TOKEN_ROTATED" if system.status == SystemStatus.APPROVED else system.status.value
        return SystemVerifyResponse(
            valid=False,
            status=rotated_status,
            message="Session token invalid or revoked.",
        )

    if request.macAddress and system.macAddress and request.macAddress != system.macAddress:
        return SystemVerifyResponse(valid=False, status="MAC_MISMATCH", message="Hardware mismatch detected.")

    if system.tokenExpiresAt and system.tokenExpiresAt < datetime.datetime.utcnow():
        if system.status != SystemStatus.EXPIRED:
            system.status = SystemStatus.EXPIRED
            system.secretTokenHash = None
            system.updatedAt = datetime.datetime.utcnow()

            db.add(
                SystemAuditLog(
                    id=str(uuid.uuid4()),
                    systemId=system.id,
                    action="TOKEN_EXPIRED_SYNC",
                    status=AuditStatus.WARNING,
                    metadata_={"reason": "Auto-sync during verification"},
                )
            )
            db.commit()

            if system.organization.owner and system.organization.owner.email:
                background_tasks.add_task(
                    mail_service.send_system_expired_email,
                    to_email=system.organization.owner.email,
                    admin_name=system.organization.owner.name,
                    system_name=system.name or "Unknown Terminal",
                    host_name=system.hostName or "Unknown",
                    ip_address=system.ipAddress or "Unknown",
                    org_name=system.organization.name,
                )

        return SystemVerifyResponse(valid=False, status="EXPIRED", message="Security token has expired.")

    if system.status != SystemStatus.APPROVED:
        return SystemVerifyResponse(valid=False, status=system.status.value, message=f"Terminal status is {system.status.value}.")

    db.add(
        SystemAuditLog(
            id=str(uuid.uuid4()),
            systemId=system.id,
            action="VERIFICATION_SUCCESS",
            status=AuditStatus.SUCCESS,
            ipAddress=fastapi_request.client.host if fastapi_request.client else "unknown",
            metadata_={"mac": request.macAddress},
        )
    )
    db.commit()

    return SystemVerifyResponse(
        valid=True,
        status="APPROVED",
        message="Terminal verified successfully.",
        systemName=system.name,
        organizationName=system.organization.name,
        organizationLogo=system.organization.logo,
    )


@router.post("/logout")
def revoke_system(request: SystemLogoutRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    system = (
        db.query(AuthorizedSystem)
        .options(joinedload(AuthorizedSystem.organization).joinedload(Organization.owner))
        .filter(AuthorizedSystem.id == request.systemId)
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found.",
        )

    if not session_token_matches(system, request.secretToken):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Terminal session token is invalid.",
        )

    system.status = SystemStatus.SUSPENDED
    system.secretTokenHash = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(
        SystemAuditLog(
            id=str(uuid.uuid4()),
            systemId=system.id,
            action="SYSTEM_REVOKED_LOGOUT",
            status=AuditStatus.INFO,
            metadata_={"reason": "User-initiated terminal logout"},
        )
    )
    db.commit()

    if system.organization.owner and system.organization.owner.email:
        background_tasks.add_task(
            mail_service.send_system_suspended_email,
            to_email=system.organization.owner.email,
            admin_name=system.organization.owner.name,
            system_name=system.name or "Unknown Terminal",
            host_name=system.hostName or "Unknown",
            ip_address=system.ipAddress or "Unknown",
            org_name=system.organization.name,
            reason="User-initiated terminal logout",
        )

    return {"success": True, "message": "System suspended successfully."}


@router.post("/cancel", status_code=status.HTTP_204_NO_CONTENT)
def cancel_system_connection(request: SystemClaimRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    system = (
        db.query(AuthorizedSystem)
        .options(joinedload(AuthorizedSystem.organization).joinedload(Organization.owner))
        .filter(AuthorizedSystem.id == request.systemId)
        .first()
    )

    if not system:
        return None

    if not claim_token_matches(system, request.claimToken):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Terminal claim token is invalid.",
        )

    system.status = SystemStatus.SUSPENDED
    system.claimTokenHash = None
    system.secretTokenHash = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(
        SystemAuditLog(
            id=str(uuid.uuid4()),
            systemId=system.id,
            action="SYSTEM_CANCELED_SUSPENDED",
            status=AuditStatus.INFO,
            metadata_={"reason": "User-initiated registration cancellation"},
        )
    )

    db.commit()

    if system.organization.owner and system.organization.owner.email:
        background_tasks.add_task(
            mail_service.send_system_suspended_email,
            to_email=system.organization.owner.email,
            admin_name=system.organization.owner.name,
            system_name=system.name or "Unknown Terminal",
            host_name=system.hostName or "Unknown",
            ip_address=system.ipAddress or "Unknown",
            org_name=system.organization.name,
            reason="User-initiated registration cancellation",
        )

    return None

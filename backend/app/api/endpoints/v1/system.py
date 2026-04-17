from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.schemas.system import SystemConnectRequest, SystemConnectResponse, SystemStatusResponse, SystemVerifyRequest, SystemVerifyResponse, SystemReauthorizeRequest
from app.models.organization import Organization
from app.models.organization_settings import OrganizationSettings
from app.models.system import AuthorizedSystem, SystemStatus
from app.models.system_log import SystemAuditLog, AuditStatus
from app.services.mail.service import mail_service
import uuid
import datetime

router = APIRouter()

@router.post("/connect", response_model=SystemConnectResponse)
def connect_system(request: SystemConnectRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    org = db.query(Organization).options(joinedload(Organization.owner)).filter(Organization.code == request.organizationCode).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or invalid security code."
        )
    
    settings = db.query(OrganizationSettings).filter(OrganizationSettings.organizationId == org.id).first()
    
    if not settings or not settings.allowSystemConnection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System connection is disabled for this organization."
        )

    existing_org_system = None
    if request.macAddress:
        all_systems_with_mac = db.query(AuthorizedSystem).filter(
            AuthorizedSystem.macAddress == request.macAddress
        ).all()

        for s in all_systems_with_mac:
            if s.organizationId == org.id:
                existing_org_system = s
                old_status = s.status
                
                s.status = SystemStatus.PENDING
                s.name = request.systemName
                s.hostName = request.hostName
                s.ipAddress = request.ipAddress
                s.updatedAt = datetime.datetime.utcnow()
                
                event_name = "CONNECTION_RETRIED_AFTER_REJECTION" if old_status == SystemStatus.REJECTED else "CONNECTION_RESUMED"
                
                db.add(SystemAuditLog(
                    id=str(uuid.uuid4()),
                    systemId=s.id,
                    action=event_name,
                    status=AuditStatus.INFO,
                    ipAddress=request.ipAddress,
                    metadata_={
                        "hostname": request.hostName, 
                        "orgCode": request.organizationCode,
                        "previous_status": old_status.value if hasattr(old_status, 'value') else str(old_status)
                    }
                ))
            else:
                if s.status in [SystemStatus.APPROVED, SystemStatus.PENDING]:
                    s.status = SystemStatus.SUSPENDED
                    s.updatedAt = datetime.datetime.utcnow()
                    
                    db.add(SystemAuditLog(
                        id=str(uuid.uuid4()),
                        systemId=s.id,
                        action="SYSTEM_SUSPENDED_MIGRATION",
                        status=AuditStatus.WARNING,
                        metadata_={"reason": "Hardware moved to new organization", "new_org": org.name}
                    ))

        if existing_org_system:
            db.commit()
            
            # Notify owner about resumed connection PENDING
            if org.owner and org.owner.email:
                background_tasks.add_task(
                    mail_service.send_system_registration_email,
                    to_email=org.owner.email,
                    admin_name=org.owner.name,
                    system_name=request.systemName,
                    host_name=request.hostName,
                    ip_address=request.ipAddress,
                    org_name=org.name
                )

            return SystemConnectResponse(
                success=True,
                message="System connection resumed and pending re-approval.",
                systemId=existing_org_system.id,
                organizationName=org.name
            )

    current_system_count = db.query(AuthorizedSystem).filter(
        AuthorizedSystem.organizationId == org.id,
        AuthorizedSystem.status != SystemStatus.REJECTED,
        AuthorizedSystem.status != SystemStatus.REVOKED,
        AuthorizedSystem.status != SystemStatus.SUSPENDED
    ).count()

    if current_system_count >= settings.maxSystems:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Organization has reached its maximum limit of {settings.maxSystems} connected systems."
        )

    new_system_id = str(uuid.uuid4())
    new_system = AuthorizedSystem(
        id=new_system_id,
        organizationId=org.id,
        name=request.systemName,
        macAddress=request.macAddress,
        hostName=request.hostName,
        ipAddress=request.ipAddress,
        status=SystemStatus.PENDING,
        createdAt=datetime.datetime.utcnow(),
        updatedAt=datetime.datetime.utcnow()
    )

    db.add(new_system)
    db.flush() 

    db.add(SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=new_system_id,
        action="CONNECTION_REQUESTED",
        status=AuditStatus.INFO,
        ipAddress=request.ipAddress,
        metadata_={"hostname": request.hostName}
    ))

    db.commit()
    db.refresh(new_system)

    # Notify owner about NEW connection request
    if org.owner and org.owner.email:
        background_tasks.add_task(
            mail_service.send_system_registration_email,
            to_email=org.owner.email,
            admin_name=org.owner.name,
            system_name=request.systemName,
            host_name=request.hostName,
            ip_address=request.ipAddress,
            org_name=org.name
        )

    return SystemConnectResponse(
        success=True,
        message="System connection requested successfully. Pending admin approval.",
        systemId=new_system.id,
        organizationName=org.name
    )

@router.get("/{system_id}/status", response_model=SystemStatusResponse)
def get_system_status(system_id: str, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found."
        )

    return SystemStatusResponse(
        status=system.status.value,
        message="Current system status retrieved.",
        secretToken=system.secretTokenHash if system.status == SystemStatus.APPROVED else None,
        systemName=system.name if system.status == SystemStatus.APPROVED else None,
        organizationName=system.organization.name if system.status == SystemStatus.APPROVED else None,
        organizationLogo=system.organization.logo if system.status == SystemStatus.APPROVED else None,
        tokenExpiresAt=system.tokenExpiresAt.isoformat() if system.tokenExpiresAt else None
    )

@router.post("/{system_id}/revoke")
def revoke_system(system_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).options(
        joinedload(AuthorizedSystem.organization).joinedload(Organization.owner)
    ).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found."
        )

    system.status = SystemStatus.SUSPENDED
    system.secretTokenHash = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        action="SYSTEM_REVOKED_LOGOUT",
        status=AuditStatus.INFO,
        metadata_={"reason": "User-initiated terminal logout"}
    ))
    db.commit()

    # Notify owner about suspension (logout)
    if system.organization.owner and system.organization.owner.email:
        background_tasks.add_task(
            mail_service.send_system_suspended_email,
            to_email=system.organization.owner.email,
            admin_name=system.organization.owner.name,
            system_name=system.name or "Unknown Terminal",
            host_name=system.hostName or "Unknown",
            ip_address=system.ipAddress or "Unknown",
            org_name=system.organization.name,
            reason="User-initiated terminal logout"
        )

    return {"success": True, "message": "System suspended successfully."}


@router.post("/verify", response_model=SystemVerifyResponse)
def verify_system(request: SystemVerifyRequest, fastapi_request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not request.secretToken:
        system_check = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == request.systemId).first()
        if system_check:
            return SystemVerifyResponse(valid=False, status=system_check.status.value, message="No token provided. Terminal not yet approved.")
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    system = db.query(AuthorizedSystem).options(
        joinedload(AuthorizedSystem.organization).joinedload(Organization.owner)
    ).filter(
        AuthorizedSystem.id == request.systemId,
        AuthorizedSystem.secretTokenHash == request.secretToken
    ).first()

    if not system:
        exists = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == request.systemId).first()
        if exists:
            return SystemVerifyResponse(valid=False, status=exists.status.value, message="Session token invalid or revoked.")
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    if request.macAddress and system.macAddress and request.macAddress != system.macAddress:
        return SystemVerifyResponse(valid=False, status="MAC_MISMATCH", message="Hardware mismatch detected.")

    if system.tokenExpiresAt and system.tokenExpiresAt < datetime.datetime.utcnow():
        if system.status != SystemStatus.EXPIRED:
            system.status = SystemStatus.EXPIRED
            system.updatedAt = datetime.datetime.utcnow()
            
            db.add(SystemAuditLog(
                id=str(uuid.uuid4()),
                systemId=system.id,
                action="TOKEN_EXPIRED_SYNC",
                status=AuditStatus.WARNING,
                metadata_={"reason": "Auto-sync during verification"}
            ))
            db.commit()
            
            # Notify owner about session expiration
            if system.organization.owner and system.organization.owner.email:
                background_tasks.add_task(
                    mail_service.send_system_expired_email,
                    to_email=system.organization.owner.email,
                    admin_name=system.organization.owner.name,
                    system_name=system.name or "Unknown Terminal",
                    host_name=system.hostName or "Unknown",
                    ip_address=system.ipAddress or "Unknown",
                    org_name=system.organization.name
                )
            
        return SystemVerifyResponse(valid=False, status="EXPIRED", message="Security token has expired.")

    if system.status != SystemStatus.APPROVED:
        return SystemVerifyResponse(valid=False, status=system.status.value, message=f"Terminal status is {system.status.value}.")

    db.add(SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        action="VERIFICATION_SUCCESS",
        status=AuditStatus.SUCCESS,
        ipAddress=fastapi_request.client.host if fastapi_request.client else "unknown",
        metadata_={"mac": request.macAddress}
    ))
    db.commit()

    return SystemVerifyResponse(
        valid=True, 
        status="APPROVED", 
        message="Terminal verified successfully.",
        systemName=system.name,
        organizationName=system.organization.name,
        organizationLogo=system.organization.logo
    )

@router.delete("/{system_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_system_connection(system_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).options(
        joinedload(AuthorizedSystem.organization).joinedload(Organization.owner)
    ).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        return None

    system.status = SystemStatus.SUSPENDED
    system.secretTokenHash = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        action="SYSTEM_CANCELED_SUSPENDED",
        status=AuditStatus.INFO,
        metadata_={"reason": "User-initiated cancellation of pending registration"}
    ))

    db.commit()

    # Notify owner about suspension (cancellation)
    if system.organization.owner and system.organization.owner.email:
        background_tasks.add_task(
            mail_service.send_system_suspended_email,
            to_email=system.organization.owner.email,
            admin_name=system.organization.owner.name,
            system_name=system.name or "Unknown Terminal",
            host_name=system.hostName or "Unknown",
            ip_address=system.ipAddress or "Unknown",
            org_name=system.organization.name,
            reason="User-initiated registration cancellation"
        )

    return None


@router.post("/reauthorize")
def reauthorize_system(request: SystemReauthorizeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).options(
        joinedload(AuthorizedSystem.organization).joinedload(Organization.owner)
    ).filter(AuthorizedSystem.id == request.systemId).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System record not found."
        )

    # Basic hardware validation
    if system.macAddress and system.macAddress != request.macAddress:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hardware ID mismatch. Re-authorization denied."
        )

    # Transition to PENDING
    old_status = system.status
    system.status = SystemStatus.PENDING
    system.secretTokenHash = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        action="REAUTHORIZATION_REQUESTED",
        status=AuditStatus.INFO,
        metadata_={
            "previous_status": old_status.value if hasattr(old_status, 'value') else str(old_status),
            "mac": request.macAddress
        }
    ))
    db.commit()

    # Notify owner about RE-AUTHORIZATION request
    if system.organization.owner and system.organization.owner.email:
        background_tasks.add_task(
            mail_service.send_system_registration_email,
            to_email=system.organization.owner.email,
            admin_name=system.organization.owner.name,
            system_name=system.name or "Unknown Terminal",
            host_name=system.hostName or "Unknown",
            ip_address=system.ipAddress or "Unknown",
            org_name=system.organization.name
        )

    return {"success": True, "message": "Re-authorization requested. Waiting for admin approval."}

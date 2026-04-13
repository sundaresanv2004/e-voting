from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.system import SystemConnectRequest, SystemConnectResponse, SystemStatusResponse, SystemVerifyRequest, SystemVerifyResponse
from app.models.organization import Organization
from app.models.organization_settings import OrganizationSettings
from app.models.system import AuthorizedSystem, SystemStatus
from app.models.system_log import SystemLog
import uuid
import datetime

router = APIRouter()

@router.post("/connect-system", response_model=SystemConnectResponse)
def connect_system(request: SystemConnectRequest, db: Session = Depends(get_db)):
    # 1. Lookup the Organization using the provided code
    org = db.query(Organization).filter(Organization.code == request.organizationCode).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or invalid security code."
        )
    
    # 2. Check Organization Settings
    settings = db.query(OrganizationSettings).filter(OrganizationSettings.organizationId == org.id).first()
    
    if not settings or not settings.allowSystemConnection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System connection is disabled for this organization. Kindly check organization settings or contact the admin."
        )

    # 3. Process existing registrations for this MAC Address
    existing_org_system = None
    if request.macAddress:
        all_systems_with_mac = db.query(AuthorizedSystem).filter(
            AuthorizedSystem.macAddress == request.macAddress
        ).all()

        for s in all_systems_with_mac:
            if s.organizationId == org.id:
                # SAME ORGANIZATION: Re-registration or Resume
                existing_org_system = s
                old_status = s.status
                
                # Always reset to PENDING as requested
                s.status = SystemStatus.PENDING
                s.name = request.systemName
                s.hostName = request.hostName
                s.ipAddress = request.ipAddress
                s.updatedAt = datetime.datetime.utcnow()
                
                # Logic: Log differently if it was a rejection vs a simple resume
                event_name = "CONNECTION_RETRIED_AFTER_REJECTION" if old_status == SystemStatus.REJECTED else "CONNECTION_RESUMED"
                
                db.add(SystemLog(
                    id=str(uuid.uuid4()),
                    systemId=s.id,
                    event=event_name,
                    metadata_={
                        "ip": request.ipAddress, 
                        "hostname": request.hostName, 
                        "orgCode": request.organizationCode,
                        "previous_status": old_status.value if hasattr(old_status, 'value') else str(old_status)
                    }
                ))
            else:
                # DIFFERENT ORGANIZATION: Hardware Migration
                # Only suspend if it was active/pending to avoid messing with REVOKED/EXPIRED history
                if s.status in [SystemStatus.APPROVED, SystemStatus.PENDING]:
                    s.status = SystemStatus.SUSPENDED
                    s.updatedAt = datetime.datetime.utcnow()
                    
                    db.add(SystemLog(
                        id=str(uuid.uuid4()),
                        systemId=s.id,
                        event="SYSTEM_SUSPENDED_MIGRATION",
                        metadata_={"reason": "Hardware moved to new organization", "new_org": org.name}
                    ))

        if existing_org_system:
            db.commit()
            return SystemConnectResponse(
                success=True,
                message="System connection resumed and pending re-approval.",
                systemId=existing_org_system.id,
                organizationName=org.name
            )

    # 4. Check System Limits before creating new
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

    # 5. Create a new AuthorizedSystem record (Hardware is new to THIS org)
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
    # Ensure logs relationship reflects the new system
    db.flush() 

    db.add(SystemLog(
        id=str(uuid.uuid4()),
        systemId=new_system_id,
        event="CONNECTION_REQUESTED",
        metadata_={"ip": request.ipAddress, "hostname": request.hostName}
    ))

    db.commit()
    db.refresh(new_system)

    return SystemConnectResponse(
        success=True,
        message="System connection requested successfully. Pending admin approval.",
        systemId=new_system.id,
        organizationName=org.name
    )

@router.get("/systems/{system_id}/status", response_model=SystemStatusResponse)
def get_system_status(system_id: str, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found."
        )

    # Fetch settings for logo/info
    settings = db.query(OrganizationSettings).filter(OrganizationSettings.organizationId == system.organizationId).first()

    return SystemStatusResponse(
        status=system.status.value,
        message="Current system status retrieved.",
        secretToken=system.secretToken if system.status == SystemStatus.APPROVED else None,
        systemName=system.name if system.status == SystemStatus.APPROVED else None,
        organizationName=system.organization.name if system.status == SystemStatus.APPROVED else None,
        organizationLogo=system.organization.logo if system.status == SystemStatus.APPROVED else None,
        tokenExpiresAt=system.tokenExpiresAt.isoformat() if system.tokenExpiresAt else None
    )

@router.post("/systems/{system_id}/revoke")
def revoke_system(system_id: str, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found."
        )

    system.status = SystemStatus.REVOKED
    system.secretToken = None
    system.tokenExpiresAt = None
    system.updatedAt = datetime.datetime.utcnow()

    db.add(SystemLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        event="SYSTEM_REVOKED_LOGOUT",
        metadata_={"reason": "User-initiated terminal logout"}
    ))
    db.commit()

    return {"success": True, "message": "System revoked successfully."}


@router.post("/systems/verify", response_model=SystemVerifyResponse)
def verify_system(request: SystemVerifyRequest, fastapi_request: Request, db: Session = Depends(get_db)):
    # Guard: if no secretToken provided, this is a PENDING/unverified terminal
    # Look up by systemId and return the actual current status — never run the token query
    if not request.secretToken:
        system_check = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == request.systemId).first()
        if system_check:
            return SystemVerifyResponse(valid=False, status=system_check.status.value, message="No token provided. Terminal not yet approved.")
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    # Find the system by ID and Secret Token
    system = db.query(AuthorizedSystem).filter(
        AuthorizedSystem.id == request.systemId,
        AuthorizedSystem.secretToken == request.secretToken
    ).first()

    if not system:
        # Check if system exists at all to differentiate between revoked vs invalid
        exists = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == request.systemId).first()
        if exists:
            return SystemVerifyResponse(valid=False, status=exists.status.value, message="Session token invalid or revoked.")
        return SystemVerifyResponse(valid=False, status="NOT_FOUND", message="System record not found.")

    # Check MAC Address if provided
    if request.macAddress and system.macAddress and request.macAddress != system.macAddress:
        return SystemVerifyResponse(valid=False, status="MAC_MISMATCH", message="Hardware mismatch detected.")

    # Check Expiration
    if system.tokenExpiresAt and system.tokenExpiresAt < datetime.datetime.utcnow():
        # AUTO-SYNC: Update status to EXPIRED in database
        if system.status != SystemStatus.EXPIRED:
            system.status = SystemStatus.EXPIRED
            system.updatedAt = datetime.datetime.utcnow()
            
            db.add(SystemLog(
                id=str(uuid.uuid4()),
                systemId=system.id,
                event="TOKEN_EXPIRED_SYNC",
                metadata_={"reason": "Auto-sync during verification"}
            ))
            db.commit()
            
        return SystemVerifyResponse(valid=False, status="EXPIRED", message="Security token has expired.")

    # Check Status (only allow if still approved)
    if system.status != SystemStatus.APPROVED:
        return SystemVerifyResponse(valid=False, status=system.status.value, message=f"Terminal status is {system.status.value}.")

    # Log verification success
    db.add(SystemLog(
        id=str(uuid.uuid4()),
        systemId=system.id,
        event="VERIFICATION_SUCCESS",
        metadata_={
            "mac": request.macAddress,
            "ip": fastapi_request.client.host if fastapi_request.client else "unknown"
        }
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

@router.delete("/systems/{system_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_system_connection(system_id: str, db: Session = Depends(get_db)):
    system = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        # If it's already gone, just return success
        return None

    # Explicitly delete any logs tied to this system first to prevent IntegrityError
    # since SQLite/Postgres might reject deletion if ON DELETE CASCADE is not strictly enforced at DB level
    db.query(SystemLog).filter(SystemLog.systemId == system_id).delete(synchronize_session=False)

    # We can safely delete the system request if the user is cancelling it.
    db.delete(system)
    db.commit()
    return None

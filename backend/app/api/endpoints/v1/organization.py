from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.system import SystemConnectRequest, SystemConnectResponse, SystemStatusResponse
from app.models.organization import Organization
from app.models.organization_settings import OrganizationSettings
from app.models.system import AuthorizedSystem, SystemStatus
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

    # 2b. Check System Limits
    current_system_count = db.query(AuthorizedSystem).filter(
        AuthorizedSystem.organizationId == org.id,
        AuthorizedSystem.status != SystemStatus.REJECTED,
        AuthorizedSystem.status != SystemStatus.REVOKED
    ).count()

    if current_system_count >= settings.maxSystems:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Organization has reached its maximum limit of {settings.maxSystems} connected systems."
        )

    # 3. Create a new AuthorizedSystem record representing this desktop client
    new_system_id = str(uuid.uuid4())
    new_system = AuthorizedSystem(
        id=new_system_id,
        organizationId=org.id,
        name=request.systemName,
        status=SystemStatus.PENDING,
        createdAt=datetime.datetime.utcnow(),
        updatedAt=datetime.datetime.utcnow()
    )

    db.add(new_system)
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
    # Lookup the requested system
    system = db.query(AuthorizedSystem).filter(AuthorizedSystem.id == system_id).first()
    
    if not system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found."
        )

    return SystemStatusResponse(
        status=system.status.value,
        message="Current system status retrieved.",
        secretToken=system.secretToken if system.status == SystemStatus.APPROVED else None,
        organizationName=system.organization.name if system.organization else None
    )

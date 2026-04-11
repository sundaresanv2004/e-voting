from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any
import random
import string
import re
import uuid
from datetime import datetime, timezone, timedelta

from app.api import deps
from app.models.organization import Organization, OrganizationType
from app.models.organization_settings import OrganizationSettings
from app.models.organization_member import OrganizationMember, OrganizationRole
from app.models.authorized_system import AuthorizedSystem, SystemType, SystemStatus
from app.models.system_audit_log import SystemAuditLog
from app.models.user import User, UserRole
from app.models.user_audit_log import UserAuditLog
from app.schemas.organization import (
    OrganizationCreate, 
    Organization as OrganizationSchema, 
    OrganizationVerify,
    OrganizationSetupResponse,
    SystemResponse
)

router = APIRouter()

def _generate_org_code(name: str, db: Session) -> str:
    """
    Generate a unique organization code like 'SU-ABCD12'.
    """
    prefix = "".join([word[0].upper() for word in name.split() if word])
    prefix = re.sub(r'[^A-Z]', '', prefix)
    
    if not prefix:
        prefix = "ORG"
    
    is_unique = False
    code = ""
    
    while not is_unique:
        suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = f"{prefix}-{suffix}"
        
        existing = db.query(Organization).filter(Organization.code == code).first()
        if not existing:
            is_unique = True
            
    return code

def _log_audit(
    db: Session,
    action: str,
    user_id: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: dict | None = None,
) -> None:
    """Log an event to the UserAuditLog table."""
    audit_entry = UserAuditLog(
        id=str(uuid.uuid4()),
        userId=user_id,
        action=action,
        ipAddress=ip_address,
        userAgent=user_agent,
        metadata=metadata,
    )
    db.add(audit_entry)

def _log_system_audit(
    db: Session,
    system_id: str,
    action: str,
    triggered_by_user_id: str | None = None,
    ip_address: str | None = None,
    metadata: dict | None = None,
) -> None:
    """Log an event to the SystemAuditLog table."""
    audit_entry = SystemAuditLog(
        id=str(uuid.uuid4()),
        systemId=system_id,
        action=action,
        triggeredByUserId=triggered_by_user_id,
        ipAddress=ip_address,
        metadata=metadata,
    )
    db.add(audit_entry)

@router.post("/", response_model=OrganizationSetupResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    *,
    db: Session = Depends(deps.get_db),
    org_in: OrganizationCreate,
    current_user: User = Depends(deps.get_current_user),
    request: Request
) -> Any:
    """
    Create a new organization and initialize settings and first system.
    """
    # Check if user already belongs to an organization
    existing_membership = db.query(OrganizationMember).filter(
        OrganizationMember.userId == current_user.id,
        OrganizationMember.isActive == True
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to an organization"
        )
    
    # 1. Generate code and create Organization
    org_id = str(uuid.uuid4())
    org_code = _generate_org_code(org_in.name, db)
    
    organization = Organization(
        id=org_id,
        name=org_in.name,
        type=org_in.type,
        code=org_code,
        ownerId=current_user.id,
        createdByUserId=current_user.id,
        updatedByUserId=current_user.id
    )
    db.add(organization)
    db.flush() # Ensure organization exists for FK constraints
    
    # 2. Create Organization Settings
    settings_id = str(uuid.uuid4())
    settings = OrganizationSettings(
        id=settings_id,
        organizationId=organization.id,
        createdByUserId=current_user.id,
        updatedByUserId=current_user.id
    )
    db.add(settings)
    
    # 3. Add user as ADMIN member of the organization
    member = OrganizationMember(
        id=str(uuid.uuid4()),
        userId=current_user.id,
        organizationId=organization.id,
        role=OrganizationRole.ADMIN,
        addedByUserId=current_user.id,
        updatedByUserId=current_user.id
    )
    db.add(member)
    
    # 3b. Update User Role
    current_user.role = UserRole.ORG_ADMIN
    
    # 4. Initialize system_out as None
    system_out = None
    
    # 4. If macAddress is provided, authorize this system (Upsert logic to handle re-registration)
    if org_in.macAddress:
        # Generate a secure system authentication token
        system_token = "".join(random.choices(string.ascii_letters + string.digits, k=64))
        
        existing_system = db.query(AuthorizedSystem).filter(
            AuthorizedSystem.macAddress == org_in.macAddress
        ).first()
        
        if existing_system:
            system = existing_system
            system.organizationId = organization.id
            system.status = SystemStatus.APPROVED
            system.authTokenHash = system_token
            system.approvedByUserId = current_user.id
            system.approvedAt = datetime.now(timezone.utc)
            system.updatedByUserId = current_user.id
            system_id = system.id
        else:
            system_id = str(uuid.uuid4())
            system = AuthorizedSystem(
                id=system_id,
                organizationId=organization.id,
                type=SystemType.ADMIN,
                macAddress=org_in.macAddress,
                status=SystemStatus.APPROVED,
                authTokenHash=system_token,
                approvedByUserId=current_user.id,
                approvedAt=datetime.now(timezone.utc),
                updatedByUserId=current_user.id
            )
            db.add(system)
        
        # Calculate expiry (15 days from now for ADMIN terminals by default)
        expires_at = datetime.now(timezone.utc) + timedelta(days=15)
        
        # For the response, we return the raw token so the client can store it
        system_out = {
            "id": system_id,
            "type": system.type,
            "token": system_token,
            "expiresAt": expires_at.isoformat()
        }
        
        # Log system registration and approval
        client_ip = request.client.host if request.client else None
        _log_system_audit(
            db, 
            system_id=system_id, 
            action="SYSTEM_REGISTERED", 
            triggered_by_user_id=current_user.id,
            ip_address=client_ip,
            metadata={"mac": org_in.macAddress, "reason": "Initial organization setup"}
        )
        _log_system_audit(
            db, 
            system_id=system_id, 
            action="OTP_VERIFIED", 
            triggered_by_user_id=current_user.id,
            ip_address=client_ip,
            metadata={"status": "APPROVED", "type": "ADMIN"}
        )
    
    # 5. Audit Log for Organization Creation
    _log_audit(
        db,
        action="ORGANIZATION_CREATED",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        metadata={"name": organization.name, "code": organization.code, "mac": org_in.macAddress}
    )
    
    db.commit()
    db.refresh(organization)
    
    return {
        "organization": organization,
        "system": system_out
    }

@router.get("/verify/{code}", response_model=OrganizationVerify)
def verify_organization(
    code: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Check if an organization exists by its unique code.
    """
    org = db.query(Organization).filter(Organization.code == code, Organization.isActive == True).first()
    
    if not org:
        return {"exists": False, "organization": None}
    
    return {
        "exists": True, 
        "organization": org
    }

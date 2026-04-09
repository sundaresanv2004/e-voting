from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.models.organization import Organization
from app.schemas.organization import OrganizationVerify, Organization as OrganizationSchema

router = APIRouter()

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

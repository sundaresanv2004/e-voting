from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Organization
from app.deps import get_current_user

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("/{org_id}")
def get_org(org_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(404, "Not found")
    return org

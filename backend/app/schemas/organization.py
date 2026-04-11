from pydantic import BaseModel
from typing import Optional
from enum import Enum

class OrganizationType(str, Enum):
    SCHOOL = "SCHOOL"
    COLLEGE = "COLLEGE"
    OTHER = "OTHER"

class OrganizationBase(BaseModel):
    name: str
    type: OrganizationType

class OrganizationCreate(OrganizationBase):
    macAddress: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[OrganizationType] = None
    logo: Optional[str] = None
    isActive: Optional[bool] = None

class SystemResponse(BaseModel):
    id: str
    type: str
    token: str
    expiresAt: str

class Organization(OrganizationBase):
    id: str
    code: str
    logo: Optional[str] = None
    isActive: bool = True

    class Config:
        from_attributes = True

class OrganizationVerify(BaseModel):
    exists: bool
    organization: Optional[Organization] = None

class OrganizationSetupResponse(BaseModel):
    organization: Organization
    system: Optional[SystemResponse] = None

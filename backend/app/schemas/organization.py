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
    code: str
    isActive: bool = True

class Organization(OrganizationBase):
    id: str
    logo: Optional[str] = None

    class Config:
        from_attributes = True

class OrganizationVerify(BaseModel):
    exists: bool
    organization: Optional[Organization] = None

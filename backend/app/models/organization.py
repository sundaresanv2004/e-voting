from sqlalchemy import Boolean, Column, String, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class OrganizationType(str, enum.Enum):
    SCHOOL = "SCHOOL"
    COLLEGE = "COLLEGE"
    OTHER = "OTHER"

class Organization(Base):
    __tablename__ = "Organization"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(OrganizationType), nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    logo = Column(String, nullable=True)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

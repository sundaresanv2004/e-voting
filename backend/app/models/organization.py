from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class OrganizationType(enum.Enum):
    SCHOOL = "SCHOOL"
    COLLEGE = "COLLEGE"
    OTHER = "OTHER"

class Organization(Base):
    __tablename__ = "Organization"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(Enum(OrganizationType, name="organizationtype"), nullable=False, default=OrganizationType.OTHER)
    code = Column(String, unique=True, nullable=False)
    logo = Column(String, nullable=True)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)
    ownerId = Column(String, nullable=True)

    settings = relationship("OrganizationSettings", back_populates="organization", uselist=False)
    systems = relationship("AuthorizedSystem", back_populates="organization")
    elections = relationship("Election", back_populates="organization")
    owner = relationship("User", back_populates="ownedOrganizations", foreign_keys=[ownerId])




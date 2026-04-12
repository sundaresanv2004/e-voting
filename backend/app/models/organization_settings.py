from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base

class OrganizationSettings(Base):
    __tablename__ = "OrganizationSettings"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), unique=True, nullable=False)
    allowSystemConnection = Column(Boolean, default=False)
    maxSystems = Column(Integer, default=20)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    organization = relationship("Organization", back_populates="settings")

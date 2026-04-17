from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="USER")
    organizationId = Column(String, ForeignKey("Organization.id"), nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

    # Relationships as needed for joining
    ownedOrganizations = relationship("Organization", back_populates="owner", foreign_keys="Organization.ownerId")

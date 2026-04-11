from sqlalchemy import Boolean, Column, String, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class OrganizationRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    VIEWER = "VIEWER"

class OrganizationMember(Base):
    __tablename__ = "OrganizationMember"
    
    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"), nullable=False)
    organizationId = Column(String, ForeignKey("Organization.id"), nullable=False)
    role = Column(Enum(OrganizationRole), nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)
    addedByUserId = Column(String, ForeignKey("User.id"), nullable=False)
    updatedByUserId = Column(String, ForeignKey("User.id"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("userId", "organizationId", name="uq_user_organization"),
    )

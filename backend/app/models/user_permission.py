from sqlalchemy import Boolean, Column, String, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class PermissionType(str, enum.Enum):
    ALL_ELECTIONS_ACCESS = "ALL_ELECTIONS_ACCESS"

class UserPermission(Base):
    __tablename__ = "UserPermission"
    
    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"), nullable=False)
    permission = Column(Enum(PermissionType), nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)
    expiresAt = Column(DateTime(timezone=True), nullable=True)
    grantedByUserId = Column(String, ForeignKey("User.id"), nullable=True) # Nullable for system-granted
    updatedByUserId = Column(String, ForeignKey("User.id"), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("userId", "permission", name="uq_user_permission"),
    )

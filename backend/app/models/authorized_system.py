from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Integer, Index
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class SystemType(str, enum.Enum):
    ADMIN = "ADMIN"
    VOTE = "VOTE"

class SystemStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"

class AuthorizedSystem(Base):
    __tablename__ = "AuthorizedSystem"
    
    id = Column(String, primary_key=True, index=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    
    type = Column(Enum(SystemType), nullable=False)
    name = Column(String, nullable=True)
    hostName = Column(String, nullable=True)
    ipAddress = Column(String, nullable=True)
    macAddress = Column(String, unique=True, index=True, nullable=False)
    
    status = Column(Enum(SystemStatus), default=SystemStatus.PENDING, nullable=False)
    
    authTokenHash = Column(String, unique=True, nullable=True)
    tokenIssuedAt = Column(DateTime(timezone=True), nullable=True)
    tokenExpiresAt = Column(DateTime(timezone=True), nullable=True)
    lastActivityAt = Column(DateTime(timezone=True), nullable=True)
    
    approvedByUserId = Column(String, ForeignKey("User.id"), nullable=True)
    approvedAt = Column(DateTime(timezone=True), nullable=True)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updatedByUserId = Column(String, ForeignKey("User.id"), nullable=True)

    __table_args__ = (
        Index("ix_system_org_status", "organizationId", "status"),
        Index("ix_system_token_expiry", "tokenExpiresAt"),
    )

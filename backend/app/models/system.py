from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class SystemStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"

class AuthorizedSystem(Base):
    __tablename__ = "AuthorizedSystem"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=True)
    hostName = Column(String, nullable=True)
    ipAddress = Column(String, nullable=True)
    macAddress = Column(String, unique=True, nullable=True)
    status = Column(Enum(SystemStatus, name="systemstatus"), default=SystemStatus.PENDING)
    secretToken = Column(String, unique=True, nullable=True)
    tokenExpiresAt = Column(DateTime, nullable=True)
    approvedByUserId = Column(String, nullable=True)
    approvedAt = Column(DateTime, nullable=True)
    lastOpenedAt = Column(DateTime, nullable=True)
    lastClosedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)
    updatedByUserId = Column(String, nullable=True)

    organization = relationship("Organization", back_populates="systems")

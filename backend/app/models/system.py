from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
import datetime

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
    macAddress = Column(String, nullable=True)
    status = Column(Enum(SystemStatus, name="systemstatus"), default=SystemStatus.PENDING)
    secretTokenHash = Column(String, unique=True, nullable=True)
    tokenExpiresAt = Column(DateTime, nullable=True)
    approvedByUserId = Column(String, nullable=True)
    approvedAt = Column(DateTime, nullable=True)
    lastOpenedAt = Column(DateTime, nullable=True)
    lastClosedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    updatedByUserId = Column(String, nullable=True)

    organization = relationship("Organization", back_populates="systems")
    logs = relationship("SystemAuditLog", back_populates="system", cascade="all, delete-orphan")
    ballots = relationship("Ballot", back_populates="system")
    electionAccess = relationship("SystemElectionAccess", back_populates="system", cascade="all, delete-orphan")

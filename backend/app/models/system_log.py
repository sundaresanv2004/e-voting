from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime
import enum

class AuditStatus(enum.Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    WARNING = "WARNING"
    INFO = "INFO"

class SystemAuditLog(Base):
    __tablename__ = "SystemAuditLog"

    id = Column(String, primary_key=True)
    systemId = Column(String, ForeignKey("AuthorizedSystem.id", ondelete="CASCADE"), nullable=False)
    electionId = Column(String, nullable=True) # Optional link to election
    action = Column(String, nullable=False)
    status = Column(Enum(AuditStatus, name="auditstatus"), default=AuditStatus.INFO)
    ipAddress = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    system = relationship("AuthorizedSystem", back_populates="logs")

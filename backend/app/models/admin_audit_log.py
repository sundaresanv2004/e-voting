from sqlalchemy import Column, String, DateTime, JSON, Index, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class AdminAuditLog(Base):
    """Tracks system and organizational administrative events."""
    __tablename__ = "AdminAuditLog"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"), nullable=True)
    action = Column(String, nullable=False)
    entityType = Column(String, nullable=False)
    entityId = Column(String, nullable=True)
    organizationId = Column(String, ForeignKey("Organization.id"), nullable=True)
    oldValues = Column(JSON, nullable=True)
    newValues = Column(JSON, nullable=True)
    ipAddress = Column(String, nullable=True)
    userAgent = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_adminaudit_user", "userId"),
        Index("ix_adminaudit_entity", "entityType", "entityId"),
        Index("ix_adminaudit_action", "action"),
        Index("ix_adminaudit_org", "organizationId"),
        Index("ix_adminaudit_created", "createdAt"),
    )

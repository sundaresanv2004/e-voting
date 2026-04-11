from sqlalchemy import Column, String, DateTime, JSON, Index, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class UserAuditLog(Base):
    """Tracks authentication-related security events."""
    __tablename__ = "UserAuditLog"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"), nullable=True)
    action = Column(String, nullable=False)
    ipAddress = Column(String, nullable=True)
    userAgent = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_useraudit_user", "userId"),
        Index("ix_useraudit_action", "action"),
        Index("ix_useraudit_created", "createdAt"),
    )

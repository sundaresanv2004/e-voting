from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Index
from sqlalchemy.sql import func
from app.db.base_class import Base

class SystemAuditLog(Base):
    __tablename__ = "SystemAuditLog"
    
    id = Column(String, primary_key=True, index=True)
    systemId = Column(String, ForeignKey("AuthorizedSystem.id", ondelete="CASCADE"), nullable=False)
    
    electionId = Column(String, nullable=True) # ForeignKey to Election when implemented
    triggeredByUserId = Column(String, ForeignKey("User.id"), nullable=True)
    
    action = Column(String, nullable=False)
    ipAddress = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_sysaudit_system", "systemId"),
        Index("ix_sysaudit_created", "createdAt"),
    )

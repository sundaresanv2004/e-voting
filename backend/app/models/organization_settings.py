from sqlalchemy import Boolean, Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class OrganizationSettings(Base):
    __tablename__ = "OrganizationSettings"
    
    id = Column(String, primary_key=True, index=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Only applies to VOTE terminals
    allowVoteSystemConnection = Column(Boolean, default=False)
    maxVoteSystems = Column(Integer, default=20) 
    
    # Session durations in minutes (Default: 15 days = 21600)
    adminSessionDuration = Column(Integer, default=21600) 
    voteSessionDuration = Column(Integer, default=21600)
    
    createdByUserId = Column(String, ForeignKey("User.id"), nullable=False)
    updatedByUserId = Column(String, ForeignKey("User.id"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

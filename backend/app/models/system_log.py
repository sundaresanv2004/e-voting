from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class SystemLog(Base):
    __tablename__ = "SystemLog"

    id = Column(String, primary_key=True)
    systemId = Column(String, ForeignKey("AuthorizedSystem.id", ondelete="CASCADE"), nullable=False)
    electionId = Column(String, nullable=True) # Optional link to election
    event = Column(String, nullable=False) # e.g., "CONNECTION_REQUESTED", "SUSPENDED"
    metadata_ = Column("metadata", JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    system = relationship("AuthorizedSystem", back_populates="logs")

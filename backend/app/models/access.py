from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class SystemElectionAccess(Base):
    __tablename__ = "SystemElectionAccess"

    id = Column(String, primary_key=True)
    systemId = Column(String, ForeignKey("AuthorizedSystem.id", ondelete="CASCADE"), nullable=False)
    electionId = Column(String, ForeignKey("Election.id", ondelete="CASCADE"), nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    system = relationship("AuthorizedSystem", back_populates="electionAccess")
    election = relationship("Election", back_populates="accessible_systems")

    __table_args__ = (
        UniqueConstraint("systemId", "electionId", name="systemelectionaccess_systemId_electionId_key"),
    )

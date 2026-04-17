from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class Voter(Base):
    __tablename__ = "Voter"

    id = Column(String, primary_key=True)
    electionId = Column(String, ForeignKey("Election.id", ondelete="CASCADE"), nullable=False)
    uniqueId = Column(String, nullable=False)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    additionalDetails = Column(JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    election = relationship("Election", back_populates="voters")
    ballot = relationship("Ballot", back_populates="voter", uselist=False)

    __table_args__ = (
        UniqueConstraint("electionId", "uniqueId", name="voter_electionId_uniqueId_key"),
    )

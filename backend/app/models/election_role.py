from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class ElectionRole(Base):
    __tablename__ = "ElectionRole"

    id = Column(String, primary_key=True)
    electionId = Column(String, ForeignKey("Election.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    order = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    election = relationship("Election", back_populates="roles")
    candidates = relationship("Candidate", back_populates="role", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="role", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("electionId", "name", name="election_role_electionId_name_key"),
    )



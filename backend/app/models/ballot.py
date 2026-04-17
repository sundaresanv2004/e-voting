from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class Ballot(Base):
    __tablename__ = "Ballot"

    id = Column(String, primary_key=True)
    electionId = Column(String, ForeignKey("Election.id", ondelete="CASCADE"), nullable=False)
    systemId = Column(String, ForeignKey("AuthorizedSystem.id"), nullable=False)
    voterId = Column(String, ForeignKey("Voter.id"), unique=True, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    election = relationship("Election", back_populates="ballots")
    system = relationship("AuthorizedSystem", back_populates="ballots")
    voter = relationship("Voter", back_populates="ballot")
    votes = relationship("Vote", back_populates="ballot", cascade="all, delete-orphan")

class Vote(Base):
    __tablename__ = "Vote"

    id = Column(String, primary_key=True)
    ballotId = Column(String, ForeignKey("Ballot.id", ondelete="CASCADE"), nullable=False)
    electionRoleId = Column(String, ForeignKey("ElectionRole.id", ondelete="CASCADE"), nullable=False)
    candidateId = Column(String, ForeignKey("Candidate.id", ondelete="SET NULL"), nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    ballot = relationship("Ballot", back_populates="votes")
    role = relationship("ElectionRole", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")

    __table_args__ = (
        UniqueConstraint("ballotId", "electionRoleId", name="vote_ballotId_electionRoleId_key"),
    )

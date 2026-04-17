from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
import datetime

class ElectionStatus(enum.Enum):
    UPCOMING = "UPCOMING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"

class Election(Base):
    __tablename__ = "Election"

    id = Column(String, primary_key=True)
    organizationId = Column(String, ForeignKey("Organization.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    startTime = Column(DateTime, nullable=False)
    endTime = Column(DateTime, nullable=False)
    status = Column(Enum(ElectionStatus, name="electionstatus"), default=ElectionStatus.UPCOMING)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="elections")
    settings = relationship("ElectionSettings", back_populates="election", uselist=False, cascade="all, delete-orphan")
    roles = relationship("ElectionRole", back_populates="election", cascade="all, delete-orphan")
    ballots = relationship("Ballot", back_populates="election", cascade="all, delete-orphan")
    voters = relationship("Voter", back_populates="election", cascade="all, delete-orphan")
    
    accessible_systems = relationship("SystemElectionAccess", back_populates="election", cascade="all, delete-orphan")

class ElectionSettings(Base):
    __tablename__ = "ElectionSettings"

    id = Column(String, primary_key=True)
    electionId = Column(String, ForeignKey("Election.id", ondelete="CASCADE"), unique=True, nullable=False)
    requireSystemAuth = Column(Boolean, default=True)
    allSystemsAllowed = Column(Boolean, default=True)
    authorizeVoters = Column(Boolean, default=True)
    showCandidateProfiles = Column(Boolean, default=True)
    showCandidateSymbols = Column(Boolean, default=True)
    shuffleCandidates = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    election = relationship("Election", back_populates="settings")

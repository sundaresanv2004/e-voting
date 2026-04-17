from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class Candidate(Base):
    __tablename__ = "Candidate"

    id = Column(String, primary_key=True)
    electionRoleId = Column(String, ForeignKey("ElectionRole.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    profileImage = Column(String, nullable=True)
    symbolImage = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    createdByUserId = Column(String, nullable=False)
    updatedByUserId = Column(String, nullable=False)

    role = relationship("ElectionRole", back_populates="candidates")
    votes = relationship("Vote", back_populates="candidate")

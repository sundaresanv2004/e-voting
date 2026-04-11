import enum
from sqlalchemy import Column, String, DateTime, Enum, Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base_class import Base

class OtpPurpose(str, enum.Enum):
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION"
    LOGIN = "LOGIN"
    PASSWORD_RESET = "PASSWORD_RESET"
    SYSTEM_REGISTRATION = "SYSTEM_REGISTRATION"

class OtpVerification(Base):
    __tablename__ = "OtpVerification"

    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    purpose = Column(Enum(OtpPurpose, name="OtpPurpose", create_type=False), nullable=False)
    
    otpHash = Column(String, nullable=False)  # HMAC-SHA256
    expiresAt = Column(DateTime(timezone=True), nullable=False)
    
    attempts = Column(Integer, default=0, nullable=False)
    maxAttempts = Column(Integer, default=5, nullable=False)
    isUsed = Column(Boolean, default=False, nullable=False)
    
    requestCount = Column(Integer, default=1, nullable=False)
    windowStart = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    ipAddress = Column(String, nullable=True)
    contextId = Column(String, nullable=True) # macAddress for SYSTEM_REGISTRATION
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("userId", "purpose", name="uq_user_purpose"),
    )

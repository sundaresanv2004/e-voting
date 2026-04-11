"""
User model — mirrors the Prisma User schema with additional security fields.
Table name matches Prisma's convention ("User") to share the same database.
"""
import enum
from sqlalchemy import (Boolean, Column, String, DateTime, Enum, Integer, ForeignKey)
from sqlalchemy.sql import func

from app.db.base_class import Base


class UserRole(str, enum.Enum):
    USER = "USER"
    ORG_ADMIN = "ORG_ADMIN"
    STAFF = "STAFF"
    ADMIN = "ADMIN"
    VIEWER = "VIEWER"


class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    emailVerified = Column(DateTime(timezone=True), nullable=True)
    image = Column(String, nullable=True)
    password = Column(String, nullable=True)  # Argon2 hashed
    role = Column(Enum(UserRole, name="UserRole", create_type=False), default=UserRole.USER, nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)

    # Security tracking fields
    lastLoginAt = Column(DateTime(timezone=True), nullable=True)
    failedLoginAttempts = Column(Integer, default=0, nullable=False)
    lockedUntil = Column(DateTime(timezone=True), nullable=True)

    tokenVersion = Column(Integer, default=1, nullable=False)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

"""
Pydantic schemas for authentication requests and responses.
"""
from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


# --------------- Enums ---------------

class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    VIEWER = "VIEWER"


# --------------- Request Schemas ---------------

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# --------------- Response Schemas ---------------

class UserResponse(BaseModel):
    id: str
    name: Optional[str] = None
    email: str
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    role: UserRole
    isActive: bool
    lastLoginAt: Optional[datetime] = None
    createdAt: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Returned after successful login or signup."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: UserResponse


class MessageResponse(BaseModel):
    message: str

"""
FastAPI dependency injection — database sessions and authenticated user extraction.
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User

# Use HTTPBearer so the client sends: Authorization: Bearer <token>
security_scheme = HTTPBearer()


def get_db() -> Generator:
    """Yield a database session per request, closing it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the current authenticated User or raises 401.
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id: str | None = payload.get("sub")
        tv: int | None = payload.get("tv")
        if user_id is None or tv is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if user.tokenVersion != tv:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalidated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Check if account is locked due to failed attempts
    if user.lockedUntil:
        from datetime import datetime, timezone
        if datetime.now(timezone.utc) < user.lockedUntil:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to too many failed login attempts",
            )

    return user

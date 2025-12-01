from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
from app.auth import decode_token

oauth2= OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2),
    session: Session = Depends(get_session)
):
    try:
        payload = decode_token(token)
        user_id= int(payload.get("sub"))
    
    except:
        raise HTTPException(401, "Invalid Token")
    
    user= session.get(User, user_id)
    if not user:
        raise HTTPException(401, "User not found")
    return user


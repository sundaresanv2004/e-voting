from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.database import get_session
from app.schemas import Token, PasswordResetRequest, PasswordResetConfirm
from app.crud import get_user_by_email
from app.auth import create_access_token, verify_password, hash_password
from app.password_reset import create_password_reset_token, verify_password_reset_token
from app.email_utils import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = get_user_by_email(session, form.username)
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/reset", tags=["Password Reset"])
def request_reset(data: PasswordResetRequest, session: Session = Depends(get_session)):
    user = get_user_by_email(session, data.email)
    if not user:
        raise HTTPException(404, "No user with that email")

    token = create_password_reset_token(data.email)
    send_password_reset_email(data.email, token)
    return {"message": "Reset email sent"}


@router.post("/reset/confirm")
def reset_confirm(data: PasswordResetConfirm, session: Session = Depends(get_session)):
    email = verify_password_reset_token(data.token)
    if not email:
        raise HTTPException(400, "Invalid or expired token")

    user = get_user_by_email(session, email)
    user.hashed_password = hash_password(data.new_password)
    session.add(user)
    session.commit()
    return {"message": "Password updated successfully"}

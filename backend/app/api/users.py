from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.schemas import UserCreate, UserRead
from app.crud import create_user
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserRead)
def new_user(
    data: UserCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user)
):
    user = create_user(session, data)
    return user

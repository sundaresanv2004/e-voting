from sqlmodel import Session, select
from .models import User, Organization
from .auth import hash_password

def get_user_by_email(session: Session, email: str):
    return session.exec(select(User).where(User.email == email)).first()

def create_user(session: Session, data):
    user = User(
        email= data.email,
        full_name= data.full_name,
        hashed_password= hash_password(data.password),
        organization_id= data.organization_id
    )

    session.add(user)
    session.commit()
    session.refresh(user)
    return user
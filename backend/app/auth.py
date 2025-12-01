from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated= "auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_minutes: int = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes= expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm= settings.ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, settings.SECRET_KEY, settings.ALGORITHM)

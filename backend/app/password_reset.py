from datetime import datetime, timedelta
from jose import jwt 
from app.config import settings

def create_password_reset_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes= settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    data= {"sub": email, "exp": expire}
    return jwt.encode(data, settings.SECRET_KEY, algorithm= settings.ALGORITHM)

def verify_password_reset_token(token: str):
    try: 
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except:
        return None
    
    
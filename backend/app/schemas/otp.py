from pydantic import BaseModel, EmailStr
from typing import Optional

class OtpVerifyRequest(BaseModel):
    code: str
    email: Optional[EmailStr] = None

class OtpResendRequest(BaseModel):
    email: Optional[EmailStr] = None

class OtpResponse(BaseModel):
    message: str
    success: bool

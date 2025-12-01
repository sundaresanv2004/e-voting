from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    organization_id: int | None = None

class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    organization_id: int | None

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

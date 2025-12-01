from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from pydantic import EmailStr

class Organization(SQLModel, table= True):
    id: int| None = Field(default=None, primary_key=True)
    name: str
    code: str = Field(default=None)
    primary_email: EmailStr
    current_election_id: int | None = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    users: List["User"] = Relationship(back_populates="organization")

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr
    full_name: str | None = None
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    organization_id: int | None = Field(default=None, foreign_key="organization.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    organization: Optional[Organization] = Relationship(back_populates="users")


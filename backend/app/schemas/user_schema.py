from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    icon: Optional[str] = Field(default=None)

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=100)

class UserUpdate(SQLModel):
    username: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None)
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)
    icon: Optional[str] = Field(default=None)

class UserLogin(SQLModel):
    email: str
    password: str
    
class UserResponse(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime


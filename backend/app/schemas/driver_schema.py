from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class DriverBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    icon: Optional[bytes] = Field(default=None)
    rating: float = Field(default=0.0)


class DriverCreate(DriverBase):
    password: str = Field(min_length=8, max_length=100)


class DriverResponse(DriverBase):
    id: int
    created_at: datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class DriverModel(SQLModel, table=True):
    __tablename__: str = 'drivers' # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    email: str = Field(unique=True, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    rating: float = Field(default=0.0)


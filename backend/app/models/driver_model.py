from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class DriverModel(SQLModel, table=True): # this line define a class create a sql table same time
    __tablename__: str = 'drivers' # type: ignore // the name of the table in the database is 'drivers'

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    email: str = Field(unique=True, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    rating: float = Field(default=0.0)

    orders: List["OrderModel"] = Relationship(back_populates="driver")


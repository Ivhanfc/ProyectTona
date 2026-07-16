from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class OrderModel(SQLModel, table=True): # this line define a class create a sql table same time
    __tablename__: str = 'orders' # type: ignore // the name of the table in the database is 'users'
    id: Optional[int] = Field(default=None, primary_key=True)
    description: str = Field(max_length=255)
    
    user_id: int = Field(foreign_key="users.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="drivers.id")

    user: "UserModel" = Relationship(back_populates="orders")
    driver: Optional["DriverModel"] = Relationship(back_populates="orders")
    
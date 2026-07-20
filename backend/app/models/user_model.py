from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.schemas.user_schema import UserBase

if TYPE_CHECKING:
    from app.models.order_model import OrderModel

class UserModel(UserBase, table=True): # this line define a class create a sql table same time
    __tablename__: str = 'users' # type: ignore // the name of the table in the database is 'users'
    hashed_password: str = Field(default=None)
    is_active: bool = Field(default=True)
    id: Optional[int] = Field(default=None, primary_key=True)

    orders: List["OrderModel"] = Relationship(back_populates="user")

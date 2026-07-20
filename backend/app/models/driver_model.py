from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.schemas.driver_schema import DriverBase

if TYPE_CHECKING:
    from app.models.order_model import OrderModel

class DriverModel(DriverBase, table=True): # this line define a class create a sql table same time
    __tablename__: str = 'drivers' # type: ignore // the name of the table in the database is 'drivers'
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(default=None)
    is_active: bool = Field(default=True)
    rating: float = Field(default=0.0)

    orders: List["OrderModel"] = Relationship(back_populates="driver")


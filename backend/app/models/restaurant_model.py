from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.order_model import OrderModel
    from app.models.menu_model import MenuItemModel

class RestaurantModel(SQLModel, table=True):
    __tablename__ = "restaurants"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(index=True)
    address: str
    phone: Optional[str] = None
    is_active: bool = Field(default=True)
    rating: float = Field(default=0.0)
        
    orders: List["OrderModel"] = Relationship(back_populates="restaurant")
    menu_items: List["MenuItemModel"] = Relationship(back_populates="restaurant")
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship

class MenuItemModel(SQLModel, table=True):
    __tablename__ = "menu_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    restaurant_id: int = Field(foreign_key="restaurants.id")

    restaurant: Optional["RestaurantModel"] = Relationship(back_populates="menu_items")
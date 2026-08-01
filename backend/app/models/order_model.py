from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.user_model import UserModel
    from app.models.driver_model import DriverModel
    from app.models.restaurant_model import RestaurantModel

class OrderModel(SQLModel, table=True):
    __tablename__: str = 'orders' # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    description: Optional[str] = Field(default=None, max_length=255, nullable=True)
    status: str = Field(default="pending", max_length=50) # "pending", "accepted", "completed"
    
    # Auto-generate creation timestamp
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    latitude: float = Field(default=32.5149)
    longitude: float = Field(default=-117.0382)
    
    user_id: int = Field(foreign_key="users.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="drivers.id", nullable=True)
    restaurant_id: Optional[int] = Field(default=None, foreign_key="restaurants.id", nullable=True)

    user: "UserModel" = Relationship(back_populates="orders")
    driver: Optional["DriverModel"] = Relationship(back_populates="orders")
    restaurant: Optional["RestaurantModel"] = Relationship(back_populates="orders")
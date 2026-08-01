from typing import Optional
from sqlmodel import SQLModel, Field

class OrderCreate(SQLModel):
    description: Optional[str] = None
    user_id: int
    restaurant_id: Optional[int] = None
    latitude: float = 32.5149
    longitude: float = -117.0382

class OrderRead(SQLModel):
    id: int
    description: Optional[str] = None
    status: str
    created_at: str
    user_id: int
    driver_id: Optional[int] = None
    restaurant_id: Optional[int] = None
    latitude: float
    longitude: float
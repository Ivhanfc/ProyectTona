from typing import Optional
from sqlmodel import SQLModel

class RestaurantCreate(SQLModel):
    name: str
    address: str
    phone: Optional[str] = None
    rating: float = 0.0          
    is_active: bool = True

class RestaurantUpdate(SQLModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None 
    is_active: Optional[bool] = None

class RestaurantRead(SQLModel):
    id: int
    name: str
    address: str
    phone: Optional[str] = None
    rating: float                
    is_active: bool

class RestaurantMinResponse(SQLModel):
    id: int
    name: str
    rating: float

class MenuRead(SQLModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    restaurant_id: int

class MenuCreate(SQLModel):
    name: str
    description: Optional[str] = None
    price: float
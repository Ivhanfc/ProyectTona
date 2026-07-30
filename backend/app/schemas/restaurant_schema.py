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
    name: str
    rating: float
from fastapi import APIRouter, HTTPException, Depends, status

from typing import List
from app.controllers.driver_Controller import DriverController 
from app.models.driver_model import DriverModel
from app.database import get_db
from sqlmodel import Session, select, SQLModel
from app.schemas.user_schema import UserLogin
from app.schemas.driver_schema import DriverCreate
from sqlmodel import Session, select
from app.models.order_model import OrderModel

router = APIRouter()
controller = DriverController()

@router.post("/drivers/login-user/", response_model=DriverModel, status_code=status.HTTP_200_OK)
def login_driver(login_data: UserLogin, db: Session = Depends(get_db)):
    driver = controller.login_driver(db=db, email=login_data.email, password=login_data.password)
    
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return driver


@router.post("/drivers/create_user/", response_model=DriverModel, status_code=status.HTTP_201_CREATED) # connect the route with the controller method to create a new driver
def create_user(driver_in: DriverCreate, db: Session = Depends(get_db)): #the method get_db is used to get database session 
    new_user = controller.create_new_driver(db=db, driver_data=driver_in) #the controlled method is called to create new driver in the controller class

    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, #return a http 400 error if the driver already exists
            detail="The username or email is registered"
        )
    return new_user

class DriverMinResponse(SQLModel): ## using a schema to return only the username and rating of the driver
    username: str
    rating : float

    
@router.get("/drivers/get_best", response_model=List[DriverMinResponse]) ## this function is used to get the best drived based in the ratings return a schema with the username and rating of the driver 
def get_best_drivers(db: Session = Depends(get_db)):
    statement = select(DriverModel) ##sql consult to get all the drivers in the database
    drivers = db.exec(statement).all()

    driver_list = list(drivers)
    n = len(driver_list)

    for i in range(n): ## bubble sort with flag to sort the drivers based in the rating from lowest to highest
        swapped = False
        for j in range(0, n - i - 1):
            if driver_list[j].rating > driver_list[j + 1].rating:
                driver_list[j], driver_list[j + 1] = driver_list[j + 1], driver_list[j]
                swapped = True
        if not swapped:
            break

    return driver_list ## return the list of drivers sorted by rating

    # Route called by React Native's fetchMapPins()
# backend/app/routes/driver_routes.py
from sqlmodel import Session, select
from app.models.order_model import OrderModel

@router.get("/drivers/nearby_orders/")
def get_nearby_orders(db: Session = Depends(get_db)):
    # Query database for unassigned pending orders
    statement = select(OrderModel).where(OrderModel.driver_id == None, OrderModel.status == "pending")
    pending_orders = db.exec(statement).all()

    # Format list for driver map pins
    return [
        {
            "id": order.id,
            "name": f"Order #{order.id}: {order.description or 'Food Order'}",
            "latitude": order.latitude,
            "longitude": order.longitude,
            "status": order.status.capitalize(),
            "distance": "0.5 km",
            "user_id": order.user_id
        }
        for order in pending_orders
    ]
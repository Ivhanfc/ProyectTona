from fastapi import APIRouter, HTTPException, Depends, status

from typing import List
from backend.app.controllers.driver_Controller import DriverController 
from backend.app.models.driver_model import DriverModel
from backend.app.database import get_db
from sqlmodel import Session, select, SQLModel

router = APIRouter()
controller = DriverController()

@router.post("/drivers/create_driver/", response_model=DriverModel, status_code=status.HTTP_201_CREATED) # connect the route with the controller method to create a new driver
def create_user(driver_in: DriverModel, db: Session = Depends(get_db)): #the method get_db is used to get database session 
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

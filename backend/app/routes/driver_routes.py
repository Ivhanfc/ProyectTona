from fastapi import APIRouter, HTTPException, Depends, status

from typing import List
from app.controllers.driver_Controller import DriverController 
from app.models.driver_model import DriverModel
from app.database import get_db
from sqlmodel import Session, select, SQLModel

router = APIRouter()
controller = DriverController()

@router.post("/drivers/create_driver/", response_model=DriverModel, status_code=status.HTTP_201_CREATED)
def create_user(driver_in: DriverModel, db: Session = Depends(get_db)):
    new_user = controller.create_new_driver(db=db, driver_data=driver_in)

    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The username or email is registered"
        )
    return new_user

class DriverMinResponse(SQLModel):
    username: str
    rating : float
    
@router.get("/drivers/get_best", response_model=List[DriverMinResponse])
def get_best_drivers(db: Session = Depends(get_db)):
    statement = select(DriverModel)
    drivers = db.exec(statement).all()

    driver_list = list(drivers)
    n = len(driver_list)

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if driver_list[j].rating > driver_list[j + 1].rating:
                driver_list[j], driver_list[j + 1] = driver_list[j + 1], driver_list[j]
                swapped = True
        if not swapped:
            break

    return driver_list
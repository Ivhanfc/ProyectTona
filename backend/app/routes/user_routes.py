from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict
from app.controllers.user_Controller import UserController
from app.models.user_model import UserModel
from app.database import get_db
from sqlmodel import Session
from app.schemas.user_schema import UserCreate, UserResponse, UserLogin
from app.controllers.order_Controller import OrderController
router = APIRouter()
controller = UserController()

@router.post("/users/create_user/", response_model=UserResponse, status_code=status.HTTP_201_CREATED) ## this router connect to the controller method to create a new user in the database
def create_user(user_in: UserCreate, db: Session = Depends(get_db)): ##returning 201 status code if the user is created successfully
    new_user = controller.create_new_user(db=db, user_data=user_in) 

    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, ##status code 400 is returned if the user already exists in the database
            detail="The username or email is registered"
        )
    return new_user

@router.post("/users/login-user/", response_model=UserResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = controller.login_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return user  


order_controller = OrderController()

@router.get("/users/{user_id}/history", status_code=status.HTTP_200_OK)
def history(user_id: int, db: Session = Depends(get_db)) -> Dict:
    user_history = order_controller.get_user_order_history_stack(db=db, user_id=user_id)

    if user_history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} does not exist or history could not be retrieved"
        )
    return user_history

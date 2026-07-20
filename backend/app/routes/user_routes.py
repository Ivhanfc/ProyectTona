from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.controllers.user_Controller import UserController
from app.models.user_model import UserModel
from app.database import get_db
from sqlmodel import Session
from app.schemas.user_schema import UserCreate

router = APIRouter()
controller = UserController()

@router.post("/users/create_user/", response_model=UserModel, status_code=status.HTTP_201_CREATED) ## this router connect to the controller method to create a new user in the database
def create_user(user_in: UserCreate, db: Session = Depends(get_db)): ##returning 201 status code if the user is created successfully
    new_user = controller.create_new_user(db=db, user_data=user_in) 

    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, ##status code 400 is returned if the user already exists in the database
            detail="The username or email is registered"
        )
    return new_user

@router.post("/users/login-user/", response_model=UserModel, status_code=status.HTTP_200_OK) ## this router connect to the controller method to login a user in the database
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = controller.login_user(db=db, email=email, password=password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return user
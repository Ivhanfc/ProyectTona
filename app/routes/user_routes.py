from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.controllers.user_Controller import UserController
from app.models.user_model import UserModel
from app.database import get_db
from sqlmodel import Session


router = APIRouter()
controller = UserController()

@router.post("/users/create_user/", response_model=UserModel, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserModel, db: Session = Depends(get_db)):
    new_user = controller.create_new_user(db=db, user_data=user_in)

    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The username or email is registered"
        )
    return new_user
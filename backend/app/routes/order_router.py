from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.controllers.order_Controller import OrderController
from app.database import get_db

router = APIRouter()
controller = OrderController()

@router.get("/orders/history", status_code=status.HTTP_200_OK)
def get_order_history(user_id: int, db: Session = Depends(get_db)):
    history_result = controller.get_user_order_history_stack(db=db, user_id=user_id)

    if not history_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no order history available"
        )

    return {
        "user_id": user_id,
        "order_history": history_result["order_history"].toArray()
    }

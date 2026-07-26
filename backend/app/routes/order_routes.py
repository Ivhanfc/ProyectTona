from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from app.database import get_db
from app.controllers.order_Controller import OrderController
from app.models.order_model import OrderModel

router = APIRouter()
controller = OrderController()

@router.get("/orders/pending", response_model=List[OrderModel], status_code=status.HTTP_200_OK)
def get_pending_orders(db: Session = Depends(get_db)):
    """
    Este endpoint devuelve la cola de órdenes pendientes.
    Solo debe ser consumido por la vista del driver.
    """
    order_queue = controller.get_pending_orders_queue(db)
    
    # Retornamos .items porque FastAPI necesita una lista iterable para el JSON
    if not order_queue.items:
        return []
        
    return order_queue.items
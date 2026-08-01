from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.controllers.order_Controller import OrderController
from app.models.order_model import OrderModel
from app.database import get_db
from typing import List
from app.schemas.order_schema import OrderCreate

router = APIRouter()
controller = OrderController()


@router.post("/orders/create_order", response_model=OrderModel, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Creates a new order from the frontend request payload.
    """
    order_data = OrderModel(**order_in.model_dump(), status="pending")
    new_order = controller.create_new_order_with_relations(db=db, order_data=order_data)

    if not new_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create order. Please check that user_id exists."
        )

    return new_order


# 2. Eliminar un pedido existente
@router.delete("/orders/{order_id}", status_code=status.HTTP_200_OK)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Elimina un pedido existente por su ID.
    """
    success = controller.delete_order(db=db, order_id=order_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el pedido con el ID {order_id} o no se pudo eliminar."
        )

    return {"detail": f"Pedido {order_id} eliminado exitosamente"}


# 3. Aceptar un pedido (Asignar a un Conductor)
@router.put("/orders/{order_id}/accept", response_model=OrderModel, status_code=status.HTTP_200_OK)
def accept_order(order_id: int, driver_id: int, db: Session = Depends(get_db)):
    """
    Asigna un pedido a un conductor y cambia su estado a 'accepted'.
    """
    accepted_order = controller.accept_order(db=db, order_id=order_id, driver_id=driver_id)

    if not accepted_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo aceptar el pedido. Verifica que el pedido exista, esté disponible y que el ID del conductor sea válido."
        )

    return accepted_order

@router.get("/orders/history/{user_id}", status_code=status.HTTP_200_OK)
def get_order_history(user_id: int, db: Session = Depends(get_db)):
    """
    Returns order history for a specific user ID sorted from newest to oldest.
    """
    history_result = controller.get_user_order_history_stack(db=db, user_id=user_id)

    if not history_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no order history available"
        )

    # Return raw list from the Stack data structure
    order_stack = history_result["order_history"]
    items_list = order_stack.items if hasattr(order_stack, 'items') else order_stack

    return items_list


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
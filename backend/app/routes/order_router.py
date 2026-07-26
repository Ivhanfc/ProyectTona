from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.controllers.order_Controller import OrderController
from app.models.order_model import OrderModel
from app.database import get_db
from typing import List

router = APIRouter()
controller = OrderController()


@router.post("/create_order", response_model=OrderModel, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderModel, db: Session = Depends(get_db)):
    """
    Crea un nuevo pedido validando la existencia previa del cliente (user_id) 
    y del conductor (driver_id, si se proporciona).
    """
    new_order = controller.create_new_order_with_relations(db=db, order_data=order_data)

    if not new_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el pedido. Verifica que el usuario o el conductor existan."
        )

    return new_order


# 2. Eliminar un pedido existente
@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
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
@router.put("/{order_id}/accept", response_model=OrderModel, status_code=status.HTTP_200_OK)
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
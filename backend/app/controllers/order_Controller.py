from typing import Dict

from sqlmodel import Session, asc, select, desc
from app.models.order_model import OrderModel
from app.models.structures_data import Queuee, Stackk
from app.models.user_model import UserModel
from app.models.driver_model import DriverModel

class OrderController: ## this controller is responsible for handling the business logic related to orders, including creating and deleting orders, as well as managing relationships with users and drivers.

    
    def create_new_order_with_relations(self, db: Session, order_data: OrderModel) -> OrderModel | None: # this method is responsible for creating a new order in the database. It takes a database session and order data as input, and returns the created order or None if the order already exists.
        try:
            existing_user = db.get(UserModel, order_data.user_id)
            if not existing_user:
                print(f"User with id {order_data.user_id} does not exist.")
                return None
           
            if order_data.driver_id is not None:
                existing_driver = db.get(DriverModel, order_data.driver_id)
                if not existing_driver:
                    print(f"Error: the driver with id {order_data.driver_id} does not exist.")
                    return None

            db.add(order_data)
            db.commit()
            db.refresh(order_data)
            return order_data
                
        except Exception as e:
            db.rollback()
            print(f"Error in create order: {e}")
            return None
        
    def delete_order(self, db: Session, order_id: int) -> bool:
        try:
            order = db.get(OrderModel, order_id)

            if not order:
                print(f"Error: The order ID {order_id} not exist")
                return False

            db.delete(order)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error in delete order: {e}")
            return False 
        
    def get_user_order_history_stack(self, db: Session, user_id: int) -> dict | None:
        try:
            user = db.get(UserModel, user_id)
            if not user:
                print(f"User with id {user_id} does not exist.")
                return None
            
            statement = (
                select(OrderModel)
                .where(OrderModel.user_id == user_id)
                .order_by(desc(OrderModel.id))
            )
            orders = db.exec(statement).all()

            history_Stack = Stackk()
            for order in orders:
                history_Stack.push(order)

            return {
                "user": user,
                "order_history": history_Stack
            }

        except Exception as e:
            print(f"Error in get_user_order_history_stack: {e}")
            return None
    
    def get_pending_orders_queue(self, db: Session) -> Queuee:
        try:
            statement = (
                select(OrderModel)
                .where(OrderModel.driver_id == None)
                .order_by(asc(OrderModel.id))
            )
            orders =db.exec(statement).all()
            order_queue = Queuee()
            for order in orders:
                order_queue.enqueue(order)

            return order_queue
        except Exception as e:
            print(f"Error in get_pending_orders_queue: {e}")
            return Queuee()
    
    def accept_order(self, db: Session, order_id: int, driver_id: int) -> OrderModel | None:
        try:
            driver = db.get(DriverModel, driver_id)
            if not driver:
                print(f"Driver with id {driver_id} does not exist.")
                return None
            
            order = db.get(OrderModel, order_id)
            if not order:
                print(f"Order with id {order_id} does not exist.")
                return None
            
            if order.driver_id is not None:
                print(f"Order with id {order_id} has already been accepted by another driver.")
                return None
            
            order.driver_id = driver_id
            order.status = "accepted"

            db.add(order)
            db.commit()
            db.refresh(order)

            print(f"Driver {driver.username} has accepted order {order.id}.")
            return order
        except Exception as e:
            db.rollback()
            print(f"Error in accept_order: {e}")
            return None
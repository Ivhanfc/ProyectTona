from typing import Dict

from sqlmodel import Session, select, desc
from backend.app.models.order_model import OrderModel
from backend.app.models.structures_data import Stackk
from backend.app.models.user_model import UserModel
from backend.app.models.driver_model import DriverModel

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
            
from sqlmodel import Session, select
from backend.app.models.order_model import OrderModel
from backend.app.models.user_model import UserModel
from backend.app.models.driver_model import DriverModel

class OrderController:
    
    def create_new_order_with_relations(self, db: Session, order_data: OrderModel) -> OrderModel | None: # this method is responsible for creating a new order in the database. It takes a database session and order data as input, and returns the created order or None if the order already exists.
        try:
            existing_user = db.get(UserModel, order_data.user_id)
            if not existing_user:
                print(f"User with id {order_data.user_id} does not exist.")
                return None
           
            existing_driver = db.get(DriverModel, order_data.driver_id)
            if not existing_driver:
                print(f"Driver with id {order_data.driver_id} does not exist.")
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
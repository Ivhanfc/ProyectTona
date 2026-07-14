from sqlmodel import Session, select
from backend.app.models.driver_model import DriverModel

class DriverController:
    
    def create_new_driver(self, db: Session, driver_data: DriverModel) -> DriverModel | None: # this method is responsible for creating a new driver in the database. It takes a database session and driver data as input, and returns the created driver or None if the driver already exists.
        try:
            statement = select(DriverModel).where(
                (DriverModel.email == driver_data.email) | (DriverModel.username == driver_data.username)
            )
            existing_user = db.exec(statement).first()

            if existing_user: ## if a driver with same email or username exists, returns none
                return None
            db.add(driver_data)
            db.commit()
            db.refresh(driver_data)

            return driver_data
        
        except Exception as e:
            db.rollback()
            print(f"Error in create Driver {e}")
            return None
        
        
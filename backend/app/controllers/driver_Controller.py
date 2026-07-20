from typing import Optional
from sqlmodel import Session, select
from app.models.driver_model import DriverModel
from app.core.security import get_password_hash, verify_password
from app.schemas.driver_schema import DriverCreate


class DriverController:
    
    def create_new_driver(self, db: Session, driver_data: DriverCreate) -> Optional[DriverModel]:
        try:
            statement = select(DriverModel).where(
                (DriverModel.email == driver_data.email) | (DriverModel.username == driver_data.username)
            )
            existing_driver = db.exec(statement).first()

            if existing_driver:
                return None
            
            plain_password = getattr(driver_data, "password", None)

            if not plain_password:
                print("Error: No password provided in request")
                return None

            hashed_pwd = get_password_hash(driver_data.password)
            driver_dict = driver_data.model_dump(exclude={"password"})
            db_driver = DriverModel(**driver_dict, hashed_password=hashed_pwd)

            db.add(db_driver)
            db.commit()
            db.refresh(db_driver)

            return db_driver
        
        except Exception as e:
            db.rollback()
            print(f"Error in create Driver: {e}")
            return None
    
    def login_driver(self, db: Session, email: str, password: str) -> Optional[DriverModel]:
        try:
            statement = select(DriverModel).where(DriverModel.email == email)
            driver = db.exec(statement).first()

            if not driver:
                return None
            
            if not getattr(driver, "hashed_password", None):
                print("Error: the driver is missing a hashed password")
                return None

            if verify_password(password, driver.hashed_password):
                return driver
            
            return None
            
        except Exception as e:
            print(f"Error in login Driver: {e}")
            return None
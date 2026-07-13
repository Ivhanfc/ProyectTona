from sqlmodel import Session, select
from app.models.user_model import UserModel

class UserController:
    
    def create_new_user(self, db: Session, user_data: UserModel) -> UserModel | None:
        try:
            statement = select(UserModel).where(
                (UserModel.email == user_data.email) | (UserModel.username == user_data.username)
            )
            existing_user = db.exec(statement).first()

            if existing_user:
                return None
            db.add(user_data)
            db.commit()
            db.refresh(user_data)

            return user_data
        
        except Exception as e:
            db.rollback()
            print(f"Error in create User {e}")
            return None
        

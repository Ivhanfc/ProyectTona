from sqlmodel import Session, select
from backend.app.models.user_model import UserModel

class UserController:
    
    def create_new_user(self, db: Session, user_data: UserModel) -> UserModel | None: # this method is responsible for creating a new user in the database. It takes a database session and user data as input, and returns the created user or None if the user already exists.
        try:
            statement = select(UserModel).where(
                (UserModel.email == user_data.email) | (UserModel.username == user_data.username)
            )
            existing_user = db.exec(statement).first()

            if existing_user: # if a user with same email or username exists, returns none
                return None
            db.add(user_data)
            db.commit()
            db.refresh(user_data)

            return user_data
        
        except Exception as e:
            db.rollback()
            print(f"Error in create User {e}")
            return None
        

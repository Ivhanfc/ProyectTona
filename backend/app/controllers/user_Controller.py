from sqlmodel import Session, select
from app.models.user_model import UserModel
from app.core.security import get_password_hash, verify_password
from app.schemas.user_schema import UserCreate
from typing import Any, Dict, Optional

class UserController:
    
    def create_new_user(self, db: Session, user_data: UserCreate) -> UserModel | None: # this method is responsible for creating a new user in the database. It takes a database session and user data as input, and returns the created user or None if the user already exists.
        try:
            statement = select(UserModel).where(
                (UserModel.email == user_data.email) | (UserModel.username == user_data.username)
            )
            existing_user = db.exec(statement).first()

            if existing_user: # if a user with same email or username exists, returns none
                return None
            
            plain_password = getattr(user_data, "password", None)

            if not plain_password:
                print("Error: No se recibió contraseña en la petición")
                return None

            hashed_pwd = get_password_hash(user_data.password)

            # 3. Extraer el diccionario excluyendo la contraseña en texto plano
            user_dict = user_data.model_dump(exclude={"password"})

            # 4. Crear la instancia del modelo de base de datos pasando el hash
            db_user = UserModel(**user_dict, hashed_password=hashed_pwd)
        


            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            return db_user
        
        except Exception as e:
            db.rollback()
            print(f"Error in create User {e}")
            return None
    
    def login_user(self, db: Session, email: str, password: str) -> UserModel | None:
        try:
            statement = select(UserModel).where(UserModel.email == email)
            user = db.exec(statement).first()

            if not user:
                return None
            
            if not user.hashed_password:
                print("Error: the user is missing a hashed password")

                return None
            if verify_password(password, user.hashed_password):
                return user
        except Exception as e:
            print(f"Error in login User {e}")
            return None


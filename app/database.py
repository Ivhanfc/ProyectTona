from sqlmodel import create_engine, Session, SQLModel
from app.models.user_model import UserModel
from app.models.driver_model import DriverModel

sqlite_file_name = "database.db" 
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args) # create a new session with new db

def create_db_and_tables():
    _ = UserModel.__tablename__
    _ = DriverModel.__tablename__
    SQLModel.metadata.create_all(engine)

def get_db(): ## if exist db, return the actual session
    with Session(engine) as session:
        yield session
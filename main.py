import uvicorn
from fastapi import FastAPI
from app.routes.user_routes import router as user_router
from app.routes.driver_routes import router as driver_router
from app.database import create_db_and_tables
from contextlib import asynccontextmanager
##imports

@asynccontextmanager
async def lifespan(app: FastAPI): ##create a new session with context and lifespan to create the database and tables if they don't exist 
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
    
app.include_router(user_router, prefix="/api/v1", tags=["Users"]) # include the user router with prefix and tags to organize the endpoints in the documentation
app.include_router(driver_router, prefix="/api/v1", tags=["Drivers"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) ## open the server port 
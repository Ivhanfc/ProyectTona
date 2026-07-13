import uvicorn
from fastapi import FastAPI
from app.routes.user_routes import router as user_router
from app.routes.driver_routes import router as driver_router
from app.database import create_db_and_tables
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
    
app.include_router(user_router, prefix="/api/v1", tags=["Users"])
app.include_router(driver_router, prefix="/api/v1", tags=["Drivers"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
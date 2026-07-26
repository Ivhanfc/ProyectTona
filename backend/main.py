import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.routes.user_routes import router as user_router
from app.routes.driver_routes import router as driver_router
from app.routes.order_router import router as order_router
from app.routes.restaurant_routes import router as restaurant_router
from app.database import create_db_and_tables
from contextlib import asynccontextmanager
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware

##imports

@asynccontextmanager
async def lifespan(app: FastAPI): ##create a new session with context and lifespan to create the database and tables if they don't exist 
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En desarrollo permitimos cualquier origen
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)



    
app.include_router(user_router, prefix="/api/v1", tags=["Users"]) # include the user router with prefix and tags to organize the endpoints in the documentation
app.include_router(driver_router, prefix="/api/v1", tags=["Drivers"])
app.include_router(order_router, prefix="/api/v1", tags=["Orders"])
app.include_router(restaurant_router, prefix="/api/v1", tags=["Restaurants"])  

app.websocket("/ws")

class TrackingManager:
    def __init__(self):
        self.active_drivers: Dict[str, WebSocket] = {}
        self.active_users: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, role: str, target_id: str):
        await websocket.accept()
        if role == "driver":
            self.active_drivers[target_id] = websocket
        elif role == "user":
            self.active_users[target_id] = websocket

    def disconnect(self, role: str, target_id: str):
        if role == "driver" and target_id in self.active_drivers:
            del self.active_drivers[target_id]
        elif role == "user" and target_id in self.active_users:
            del self.active_users[target_id]
        
    async def send_location_to_user(self, user_id: str, lat: float, lon: float, driver_id: str):
        if user_id in self.active_users:
            websocket = self.active_users[user_id]
            payload = {
                "driver_id": driver_id,
                "lat": lat,
                "lon": lon
            }
            await websocket.send_json(payload)

manager = TrackingManager()

@app.websocket("/ws/{role}/{target_id}")
async def ubication_realtime_handler(websocket: WebSocket, role: str, target_id: str):
    if role not in ["driver", "user"]:
        await websocket.close(code=4000, reason="Invalid role")
        return
    
    await manager.connect(websocket, role, target_id)
    print(f"New connection: {role.capitalize()} con ID {target_id} connected")

    try:
        while True:
            data = await websocket.receive_json()
            if role == "driver":
                lon = data.get("lon")
                lat = data.get("lat")
                user_id = data.get("user_id")

                if lon is not None and lat is not None and user_id is not None:
                    print(lat,lon)
                    await manager.send_location_to_user(user_id, lat, lon, driver_id=target_id)

    except WebSocketDisconnect:
        print("The client is disconnected")
    except Exception as e:
        print(f"{e}")     
    finally:
        manager.disconnect(role, target_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) ## open the server port 
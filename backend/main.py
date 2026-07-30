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
import httpx
from typing import Dict, Optional
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

osrm_url = "http://localhost:5000"

async def get_osrm_route(start_lon: float, start_lat: float, end_lon: float, end_lat: float):
    url = f"{osrm_url}/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("routes"):
                    route = data["routes"][0]
                    return {
                        "distance": route["distance"],
                        "duration": route["duration"],
                        "geometry": route["geometry"]
                    }
        except Exception as e:
            print(f"Error in connection with OSRM {e}")
    return None


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
        
    async def send_location_to_user(self, user_id: str, lat: float, lon: float, driver_id: str, route_info: Optional[dict] = None):
        if user_id in self.active_users:
            websocket = self.active_users[user_id]
            payload = {
                "driver_id": driver_id,
                "lat": lat,
                "lon": lon,
                "route_info": route_info
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

                dest_lon = data.get("dest_lon")
                dest_lat = data.get("dest_lat")

                if lon is not None and lat is not None and user_id is not None:
                    print(lat,lon)

                    route_data = None

                    if dest_lon is not None and dest_lat is not None:
                        route_data = await get_osrm_route(lon, lat, dest_lon, dest_lat)

                    await manager.send_location_to_user(user_id, lat, lon, driver_id=target_id, route_info=route_data)

    except WebSocketDisconnect:
        print("The client is disconnected")
    except Exception as e:
        print(f"{e}")     
    finally:
        manager.disconnect(role, target_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) ## open the server port 
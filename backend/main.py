import uvicorn
import httpx
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Dict, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.routes.user_routes import router as user_router
from app.routes.driver_routes import router as driver_router
from app.routes.order_router import router as order_router
from app.routes.restaurant_routes import router as restaurant_router

from app.models.restaurant_model import RestaurantModel
from app.models.menu_model import MenuItemModel


def seed_initial_data():
    """Populates an empty database with multiple initial restaurants and menu items."""
    with Session(engine) as session:
        # Check if restaurants already exist
        existing_restaurant = session.exec(select(RestaurantModel)).first()
        if not existing_restaurant:
            print("🌱 Seeding initial restaurant & menu data...")

            # Define your list of restaurants and their respective menu items
            restaurants_data = [
                {
                    "info": {
                        "name": "Burger Palace 🍔",
                        "address": "123 Main St, Tijuana",
                        "phone": "664-123-4567",
                        "rating": 4.8
                    },
                    "menu": [
                        {
                            "name": "Classic Cheese Burger 🧀",
                            "description": "Juicy beef patty with cheddar cheese, lettuce, and secret sauce.",
                            "price": 9.99
                        },
                        {
                            "name": "Double Bacon Smash 🥓",
                            "description": "Two smashed beef patties, crispy bacon, and double American cheese.",
                            "price": 12.50
                        },
                        {
                            "name": "Crispy French Fries 🍟",
                            "description": "Golden crispy salted potatoes with dip.",
                            "price": 3.99
                        }
                    ]
                },
                {
                    "info": {
                        "name": "Pizza Palace 🍕",
                        "address": "456 Revolución Ave, Tijuana",
                        "phone": "664-987-6543",
                        "rating": 4.6
                    },
                    "menu": [
                        {
                            "name": "Pepperoni Supreme 🍕",
                            "description": "Loaded with double pepperoni, mozzarella, and marinara sauce.",
                            "price": 14.99
                        },
                        {
                            "name": "Garlic Cheese Sticks 🥖",
                            "description": "Baked dough brushed with garlic butter and melted cheese.",
                            "price": 6.50
                        }
                    ]
                },
                {
                    "info": {
                        "name": "Tacos El Guero 🌮",
                        "address": "789 Agua Caliente Blvd, Tijuana",
                        "phone": "664-555-0199",
                        "rating": 4.9
                    },
                    "menu": [
                        {
                            "name": "Taco de Carne Asada 🥩",
                            "description": "Handmade corn tortilla with grilled steak, guacamole, and salsa.",
                            "price": 2.50
                        },
                        {
                            "name": "Taco de Adobada 🌮",
                            "description": "Marinated pork taco topped with pineapple and cilantro.",
                            "price": 2.25
                        }
                    ]
                }
            ]

            # Iterate and save to SQLite
            for data in restaurants_data:
                restaurant = RestaurantModel(**data["info"])
                session.add(restaurant)
                session.commit()
                session.refresh(restaurant)

                menu_items = [
                    MenuItemModel(**item, restaurant_id=restaurant.id)
                    for item in data["menu"]
                ]
                session.add_all(menu_items)

            session.commit()
            print("✅ Multiple restaurants and menus seeded successfully!")
    """Populates an empty database with initial restaurants and menu items."""
    with Session(engine) as session:
        # Check if restaurants already exist
        existing_restaurant = session.exec(select(RestaurantModel)).first()
        if not existing_restaurant:
            print("🌱 Seeding initial restaurant & menu data...")
            
            # Sample restaurant
            restaurant = RestaurantModel(
                name="Burger Palace",
                address="123 Main St, Tijuana",
                phone="664-123-4567",
                rating=4.8
            )
            session.add(restaurant)
            session.commit()
            session.refresh(restaurant)

            # Sample menu items
            items = [
                MenuItemModel(
                    name="Classic Cheese Burger 🍔",
                    description="Juicy beef patty with cheddar cheese, lettuce, and secret sauce.",
                    price=9.99,
                    restaurant_id=restaurant.id
                ),
                MenuItemModel(
                    name="Double Bacon Smash 🥓",
                    description="Two smashed beef patties, crispy bacon, and double American cheese.",
                    price=12.50,
                    restaurant_id=restaurant.id
                ),
                MenuItemModel(
                    name="Crispy French Fries 🍟",
                    description="Golden crispy salted potatoes with dip.",
                    price=3.99,
                    restaurant_id=restaurant.id
                )
            ]
            session.add_all(items)
            session.commit()
            print("✅ Initial data seeded successfully!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context lifespan to create database tables and seed initial mock data."""
    create_db_and_tables()
    seed_initial_data()
    yield


app = FastAPI(lifespan=lifespan)

# CORS configuration for mobile and web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registrations
app.include_router(user_router, prefix="/api/v1", tags=["Users"])
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
            print(f"Error in connection with OSRM: {e}")
    return None


class TrackingManager:
    def __init__(self):
        self.active_drivers: Dict[str, WebSocket] = {}
        self.active_users: Dict[str, WebSocket] = {}
        self.driver_locations: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, role: str, target_id: str):
        await websocket.accept()
        if role == "driver":
            self.active_drivers[target_id] = websocket
        elif role == "user":
            self.active_users[target_id] = websocket

    def disconnect(self, role: str, target_id: str):
        if role == "driver":
            if target_id in self.active_drivers:
                del self.active_drivers[target_id]
            if target_id in self.driver_locations:
                del self.driver_locations[target_id]
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


@app.get("/api/v1/drivers/active-locations")
def get_active_drivers_locations():
    """Endpoint used to consult active drivers coordinates in real-time."""
    return manager.driver_locations


@app.websocket("/ws/{role}/{target_id}")
async def ubication_realtime_handler(websocket: WebSocket, role: str, target_id: str):
    if role not in ["driver", "user"]:
        await websocket.close(code=4000, reason="Invalid role")
        return
    
    await manager.connect(websocket, role, target_id)
    print(f"New connection: {role.capitalize()} with ID {target_id} connected")

    try:
        while True:
            data = await websocket.receive_json()
            if role == "driver":
                lon = data.get("lon")
                lat = data.get("lat")
                user_id = data.get("user_id")

                dest_lon = data.get("dest_lon")
                dest_lat = data.get("dest_lat")

                if lon is not None and lat is not None:
                    manager.driver_locations[target_id] = {
                        "lat": lat,
                        "lon": lon,
                        "updated_at": datetime.now().isoformat()
                    }

                if lon is not None and lat is not None and user_id is not None:
                    print(lat, lon)
                    route_data = None

                    if dest_lon is not None and dest_lat is not None:
                        route_data = await get_osrm_route(lon, lat, dest_lon, dest_lat)

                    await manager.send_location_to_user(user_id, lat, lon, driver_id=target_id, route_info=route_data)

    except WebSocketDisconnect:
        print("The client is disconnected")
    except Exception as e:
        print(f"WS Exception: {e}")     
    finally:
        manager.disconnect(role, target_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
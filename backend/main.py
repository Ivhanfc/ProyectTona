from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos los archivos de rutas que ya tienes creados

from app.routes import driver_routes
from app.routes import user_routes
from app.routes import order_routes

app = FastAPI(title="UberClon API")

# Permite que tu aplicación de Expo (que está en otra IP) se comunique con este backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En desarrollo permitimos cualquier origen
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# Conectamos las rutas al servidor principal
app.include_router(driver_routes.router)
app.include_router(user_routes.router)
app.include_router(order_routes.router)

# Ruta base de prueba para saber si el servidor está encendido
@app.get("/")
def read_root():
    return {"message": "El servidor FastAPI está corriendo perfectamente."}
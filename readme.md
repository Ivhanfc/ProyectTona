# Proyect TheEater

```mermaid
graph TD
    %% Base Setup
    root[PROYECTTONA/] 
    config[config.py]
    db_file[(database.db)]
    main[main.py]

    %% Main connections
    root --> app[app/]
    root --> config
    root --> db_file
    root --> main

    %% Inside App (MVC Structure)
    app --> controllers[controllers/]
    app --> models[models/]
    app --> routes[routes/]
    app --> db_py[database.py]

    %% Controllers
    controllers --> dc[driver_Controller.py]
    controllers --> uc[user_Controller.py]

    %% Models
    models --> dm[driver_model.py]
    models --> um[user_model.py]

    %% Routes
    routes --> dr[driver_routes.py]
    routes --> ur[user_routes.py]

    %% Styling to look professional
    style root fill:#1F2937,stroke:#374151,stroke-width:2px,color:#fff
    style app fill:#0F766E,stroke:#115E59,stroke-width:2px,color:#fff
    style controllers fill:#B45309,stroke:#92400E,stroke-width:1px,color:#fff
    style models fill:#0369A1,stroke:#075985,stroke-width:1px,color:#fff
    style routes fill:#4D7C0F,stroke:#3F6212,stroke-width:1px,color:#fff
    style db_file fill:#4B5563,stroke:#374151,color:#fff
    ```

## Descripción general

ProyectTona es un prototipo de plataforma de delivery de alimentos inspirada en experiencias como Uber Eats y Rappi. El proyecto busca simular el flujo completo de una aplicación de entregas: usuarios pueden explorar restaurantes y menús, crear pedidos, mientras que los repartidores pueden ver órdenes pendientes, aceptarlas y recibir actualizaciones en tiempo real de ubicación.

La solución está compuesta por un backend en FastAPI y una aplicación móvil desarrollada con React Native y Expo. Además, incorpora comunicación en tiempo real mediante WebSockets y soporte para cálculo de rutas con OSRM.

## Objetivo principal

Implementar una experiencia funcional de entrega de alimentos con una arquitectura modular que permita:

- gestionar restaurantes, usuarios, repartidores y pedidos;
- simular la interacción entre cliente y repartidor;
- exponer APIs REST para la lógica de negocio;
- mostrar ubicaciones en tiempo real y rutas aproximadas;
- servir como base para un proyecto académico o de demostración.

## Requisitos previos

Antes de levantar el proyecto, asegúrate de tener instalado lo siguiente:

- Python 3.10 o superior
- Node.js 18 o superior
- npm o yarn
- Expo CLI (opcional si prefieres usar npx expo)
- Un servidor OSRM local opcional en http://localhost:5000 para cálculo de rutas

## Tecnologías utilizadas

- Backend: FastAPI, SQLModel, Uvicorn, HTTPX
- Frontend: React Native, Expo, Axios, React Navigation, react-native-maps
- Base de datos: SQLite
- Comunicación en tiempo real: WebSockets
- Ruteo: OSRM

## Instalación y configuración

### 1. Backend

Desde la raíz del proyecto:

```bash
cd backend
python -m venv .venv
```

Activación del entorno virtual:

- Windows:

```bash
.venv\Scripts\activate
```

- Linux/macOS:

```bash
source .venv/bin/activate
```

Instalación de dependencias:

```bash
pip install fastapi uvicorn sqlmodel httpx
```

Ejecución del servidor:

```bash
python main.py
```

El backend quedará disponible en:

- http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs

La base de datos SQLite se crea automáticamente al iniciar la aplicación.

### 2. Frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm install
```

Configura la URL del backend para la app móvil. Si vas a probarla desde un dispositivo físico, utiliza la IP de tu máquina en lugar de localhost:

- Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_URLSERVER="http://192.168.1.103:8000"
```

- Bash/Linux/macOS:

```bash
export EXPO_PUBLIC_URLSERVER="http://192.168.1.103:8000"
```

Inicia la aplicación:

```bash
npx expo start
```

--------------> Si vas a probar la app en un emulador Android, puede ser necesario usar la IP local del host o el valor 10.0.2.2 según tu configuración.

### 3. Servidor OSRM (opcional)

Para habilitar cálculo de rutas más realista, puedes levantar un servidor OSRM local y dejarlo disponible en http://localhost:5000. Si no está activo, la aplicación puede seguir funcionando, aunque algunas funciones de ruta y ETA quedarán limitadas.

## Estructura del proyecto

```text
ProyectTona_beta6/
├── backend/
│   ├── main.py                  # Punto de entrada del servidor FastAPI
│   ├── config.py                # Configuraciones de entorno y utilidades
│   ├── app/
│   │   ├── controllers/         # Lógica de negocio de usuarios, pedidos y restaurantes
│   │   ├── models/              # Modelos SQLModel para la base de datos
│   │   ├── routes/              # Endpoints REST y WebSockets
│   │   ├── schemas/             # Esquemas de entrada/salida de datos
│   │   └── database.py          # Configuración de la conexión SQLite
│   └── oldest/                  # Versiones antiguas o prototipos del backend
├── frontend/
│   ├── src/
│   │   ├── app/                 # Pantallas, navegación y vistas principales
│   │   ├── services/            # Cliente HTTP para consumir la API
│   │   └── config/              # Configuraciones auxiliares como mapas
│   └── assets/                  # Recursos visuales e íconos
├── oldest/                      # Prototipos previos del proyecto
└── readme.md                    # Documentación general del repositorio
```

## Funcionalidades principales

- Registro y manejo de usuarios y repartidores
- Gestión de restaurantes y menús
- Creación de pedidos y seguimiento de estado
- Cola de órdenes pendientes para repartidores
- Historial de pedidos por usuario
- Seguimiento de ubicación en tiempo real
- Integración con rutas y estimación de tiempos


----------> Notas de desarrollo <-----------

- El proyecto sigue una estructura modular orientada a separar responsabilidades entre controladores, modelos, rutas y esquemas.
- La base de datos se inicializa automáticamente con tablas y datos de ejemplo al arrancar el backend.
- Para pruebas locales, es recomendable usar una IP local en la configuración del frontend para evitar problemas de conexión desde dispositivos móviles.

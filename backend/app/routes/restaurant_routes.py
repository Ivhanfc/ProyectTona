from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.schemas.restaurant_schema import MenuCreate # Asegúrate de importar el esquema de creación de menú
from app.database import get_db
from app.schemas.restaurant_schema import RestaurantCreate, RestaurantRead, RestaurantUpdate, RestaurantMinResponse, MenuRead
from app.controllers.Restaurant_Controller import RestaurantController
from app.models.restaurant_model import RestaurantModel

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])
restaurant_controller = RestaurantController()

@router.post("/create_new_restaurant", response_model=RestaurantRead, status_code=status.HTTP_201_CREATED)
def create_restaurant(restaurant_data: RestaurantCreate, db: Session = Depends(get_db)):
    new_restaurant = restaurant_controller.create_new_restaurant(db, restaurant_data)
    if not new_restaurant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el restaurante. Es posible que ya exista."
        )
    return new_restaurant

@router.get("/", response_model=List[RestaurantRead])
def read_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return restaurant_controller.get_all_restaurants(db, skip=skip, limit=limit)


@router.get("/get_best", response_model=List[RestaurantMinResponse])
def get_best_restaurants(db: Session = Depends(get_db)):
    statement = select(RestaurantModel)
    restaurants = db.exec(statement).all()

    restaurant_list = list(restaurants)
    n = len(restaurant_list)

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if restaurant_list[j].rating < restaurant_list[j + 1].rating:
                restaurant_list[j], restaurant_list[j + 1] = restaurant_list[j+1], restaurant_list[j]
                swapped = True
        if not swapped:
            break

    return restaurant_list

# 3. Obtener un restaurante por ID
@router.get("/{restaurant_id}", response_model=RestaurantRead)
def read_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = restaurant_controller.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurante con id {restaurant_id} no encontrado."
        )
    return restaurant

@router.patch("/{restaurant_id}", response_model=RestaurantRead)
def update_restaurant(restaurant_id: int, update_data: RestaurantUpdate, db: Session = Depends(get_db)):
    updated_restaurant = restaurant_controller.update_restaurant(db, restaurant_id, update_data)
    if not updated_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se pudo actualizar el restaurante con id {restaurant_id}."
        )
    return updated_restaurant

@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    success = restaurant_controller.delete_restaurant(db, restaurant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurante con id {restaurant_id} no encontrado o no se pudo eliminar."
        )
    return None

@router.get("/{restaurant_id}/menu", response_model=List[MenuRead]) # O el esquema que uses para el menú
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    # Lógica para buscar los platillos del restaurante con ese ID
    menu_items = restaurant_controller.get_menu_by_restaurant_id(db, restaurant_id)
    return menu_items


@router.post("/{restaurant_id}/menu", response_model=MenuRead, status_code=status.HTTP_201_CREATED)
def create_menu_item(restaurant_id: int, menu_data: MenuCreate, db: Session = Depends(get_db)):
    # Validar que el restaurante exista primero opcionalmente
    restaurant = restaurant_controller.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurante con id {restaurant_id} no encontrado."
        )
    
    new_item = restaurant_controller.create_menu_item_for_restaurant(db, restaurant_id, menu_data)
    if not new_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el platillo en el menú."
        )
    return new_item
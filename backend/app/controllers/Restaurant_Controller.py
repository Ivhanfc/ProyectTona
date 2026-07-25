from sqlmodel import Session, select
from app.models.restaurant_model import RestaurantModel
from app.core.security import get_password_hash, verify_password
from app.schemas.restaurant_schema import RestaurantCreate, RestaurantRead, RestaurantUpdate

class RestaurantController:
    def create_new_restaurant(self, db: Session, restaunt_data: RestaurantCreate) -> RestaurantModel | None:
         try:
              statement = select(RestaurantModel).where(
                   (RestaurantModel.name == restaunt_data.name) &
                   (RestaurantModel.address == restaunt_data.address)
              )
              existing_restaurant = db.exec(statement).first()

              if existing_restaurant:
                print(f"Error: A restaurant with name '{restaurant_data.name}' at this address already exists.")
                return None

              restaurant_dict = restaunt_data.model_dump()
              db_restaurant = RestaurantModel(**restaurant_dict)

              db.add(db_restaurant)
              db.commit()
              db.refresh(db_restaurant)

              return db_restaurant

         except Exception as e:
            db.rollback()
            print(f"Error in create_new_restaurant: {e}")
            return None

    def get_restaurant_by_id(self, db: Session, restaurant_id: int) -> RestaurantModel | None:
        try:
            return db.get(RestaurantModel, restaurant_id)
        except Exception as e:
            print(f"Error in get_restaurant_by_id: {e}")
            return None

    def get_all_restaurants(self, db: Session, skip: int = 0, limit: int = 100) -> List[RestaurantModel]:
        try:
            statement = select(RestaurantModel).offset(skip).limit(limit)
            return list(db.exec(statement).all())
        except Exception as e:
            print(f"Error in get_all_restaurants: {e}")
            return [] 

    def update_restaurant(self, db: Session, restaurant_id: int, update_data: RestaurantUpdate) -> RestaurantModel | None:
        try:
            db_restaurant = db.get(RestaurantModel, restaurant_id)
            if not db_restaurant:
                print(f"Restaurant with id {restaurant_id} does not exist.")
                return None

            # Extraemos los campos modificados descartando los no enviados
            update_dict = update_data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(db_restaurant, key, value)

            db.add(db_restaurant)
            db.commit()
            db.refresh(db_restaurant)

            return db_restaurant

        except Exception as e:
            db.rollback()
            print(f"Error in update_restaurant: {e}")
            return None

    def delete_restaurant(self, db: Session, restaurant_id: int) -> bool:
        try:
            restaurant = db.get(RestaurantModel, restaurant_id)
            if not restaurant:
                print(f"Restaurant with id {restaurant_id} does not exist.")
                return False

            db.delete(restaurant)
            db.commit()
            return True

        except Exception as e:
            db.rollback()
            print(f"Error in delete_restaurant: {e}")
            return False

    
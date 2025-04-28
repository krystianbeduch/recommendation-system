from fastapi import APIRouter, HTTPException, Body
from pymongo.errors import PyMongoError
from models import UserModel, CreateUserRequest
from db import users_collection

router = APIRouter()

@router.get("/", response_model=list[UserModel])
async def get_all_users():
    try:
        users_cursor = users_collection.find({}, {"_id": 0})
        users = await users_cursor.to_list(length=None)
        if not users:
            raise HTTPException(status_code=404, detail="Users not found")
        return users
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/{user_id}", response_model=UserModel)
async def get_user(user_id: int):
    try:
        user_data = await users_collection.find_one({"userId": user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        return user_data
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


@router.post("/add", response_model=dict, status_code=201)
async def create_user(user: CreateUserRequest):
    try:
        username = user.username
        genres = user.favoriteGenres
        languages = user.languagePreferences

        if not username:
            raise HTTPException(status_code=400, detail="Username is required")

        # Generowanie userId - największy istniejący + 1
        last_user = await users_collection.find_one(
            {}, sort=[("userId", -1)]
        )
        new_user_id = (last_user["userId"] + 1) if last_user else 1

        new_user = {
            "userId": new_user_id,
            "username": username,
            "favoriteGenres": genres,
            "languagePreferences": languages
        }

        result = await users_collection.insert_one(new_user)

        response = {
            "id": str(result.inserted_id),
            "userId": new_user_id,
            "username": username,
            "favoriteGenres": genres,
            "languagePreferences": languages
        }
        return response

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")

@router.put("/edit/{user_id}", response_model=UserModel)
async def update_user(user_id: int, user: UserModel):
    try:
        user_data = await users_collection.find_one({"userId": user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = user.dict(exclude_unset=True)
        await users_collection.update_one(
            {"userId": user_id},
            {"$set": update_data}
        )

        updated_user = await users_collection.find_one({"userId": user_id})
        return updated_user
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int):
    try:
        result = await users_collection.delete_one({"userId": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


##### ABC #####
async def get_user_preferences(user_id: int) -> dict:
    """Pobiera preferencje użytkownika z bazy MongoDB."""
    try:
        user = await users_collection.find_one({"userId": user_id})
        if not user:
            raise ValueError(f"Użytkownik o ID {user_id} nie został znaleziony.")
        return {
            "favouriteGenres": user.get("favoriteGenres", []),
            "languagePreferences": user.get("languagePreferences", [])
        }
    except Exception as e:
        raise ValueError(f"Błąd podczas pobierania użytkownika: {str(e)}")

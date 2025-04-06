from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from models import UserModel
from db import users_collection

router = APIRouter()

@router.get("/{user_id}", response_model=UserModel)
async def get_user(user_id: int):
    try:
        user_data = await users_collection.find_one({"user_id": user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        return user_data
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")

@router.post("/", response_model=UserModel)
async def create_user(user: UserModel):
    try:
        existing_user = await users_collection.find_one({"user_id": user.user_id})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        await users_collection.insert_one(user.dict())
        return user

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


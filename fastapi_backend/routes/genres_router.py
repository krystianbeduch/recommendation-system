from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from db import genres_collection
from models import Genre

router = APIRouter()

@router.get("/", response_model=list[Genre])
async def get_genres():
    try:
        genres = list(genres_collection.find({}, {"_id": 0}))  # Pobiera wszystkie dokumenty, bez _id
        if not genres:
            raise HTTPException(status_code=404, detail="No genres found")
        return genres
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")
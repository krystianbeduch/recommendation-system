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


##### ABC #####
async def get_all_genres_id() -> list[int]:
    """Pobiera listę wszystkich ID gatunków z bazy MongoDB."""
    genres_cursor = genres_collection.find({})
    genres = await genres_cursor.to_list(length=1000)
    return [genre["id"] for genre in genres]
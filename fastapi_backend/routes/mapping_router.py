from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from typing import List
from models import SpokenLanguage, Genre
from db import languages_collection, genres_collection

router = APIRouter()

@router.get("/languages", response_model=list[SpokenLanguage])
async def get_languages():
    try:
        languages_cursor = languages_collection.find({}, {"_id": 0})  # Pobiera wszystkie dokumenty, bez _id
        languages = await languages_cursor.to_list(length=None)
        if not languages:
            raise HTTPException(status_code=404, detail="No genres found")
        return languages
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")

@router.get("/genres", response_model=list[Genre])
async def get_genres():
    try:
        genres_cursor = genres_collection.find({}, {"_id": 0})  # Pobiera wszystkie dokumenty, bez _id
        genres = await genres_cursor.to_list(length=None) # Asynchronicznie konwertuje kursor na listę
        if not genres:
            raise HTTPException(status_code=404, detail="No genres found")
        return genres
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")
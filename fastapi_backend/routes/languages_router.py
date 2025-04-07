from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from typing import List
from models import SpokenLanguage
from db import languages_collection

router = APIRouter()

@router.get("/", response_model=list[SpokenLanguage])
async def get_languages():
    try:
        languages = list(languages_collection.find({}, {"_id": 0}))  # Pobiera wszystkie dokumenty, bez _id
        if not languages:
            raise HTTPException(status_code=404, detail="No genres found")
        return languages
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")



##### ABC #####
async def get_all_languages_codes() -> list[str]:
    """Pobiera listę wszystkich kodów języków z bazy MongoDB."""
    languages_cursor = languages_collection.find({})
    languages = await languages_cursor.to_list(length=1000)
    return [language["iso_639_1"] for language in languages]
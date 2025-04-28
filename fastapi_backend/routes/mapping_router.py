from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from models import SpokenLanguage, Genre
from db import genres_collection, movies_collection

router = APIRouter()

@router.get("/languages", response_model=list[SpokenLanguage])
async def get_languages():
    try:
        pipeline = [
            {"$unwind": "$spoken_languages"},  # Rozwijamy tablicę 'spoken_languages' w każdym filmie
            {"$group": {
                "_id": "$spoken_languages.iso_639_1",  # Grupujemy po iso_639_1
                "count": {"$sum": 1}  # Zliczamy filmy w danym języku
            }},
            {"$lookup": {  # Łączymy z kolekcją languages, aby uzyskać nazwę języka
                "from": "spoken_languages",  # Kolekcja z danymi języków
                "localField": "_id",  # Łączenie po iso_639_1
                "foreignField": "iso_639_1",
                "as": "language_info"
            }},
            {"$unwind": "$language_info"},  # Rozwijamy tablicę 'language_info' (jeśli istnieje)
            {"$project": {
                "_id": 0,
                "iso_639_1": "$_id",
                "name": "$language_info.name",  # Pobieramy nazwę języka
                "count": 1  # Zwracamy liczbę filmów
            }},
            {"$sort": {"count": -1}}  # Sortujemy wyniki po liczbie filmów (malejąco)
        ]

        languages_cursor = movies_collection.aggregate(pipeline)
        languages = await languages_cursor.to_list(length=None)
        if not languages:
            raise HTTPException(status_code=404, detail="No languages found")
        return languages
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")

@router.get("/languages/count", response_model=dict[str, int])
async def get_languages_count():
    try:
        # Pobranie liczby filmow w kazdym jezyku
        pipeline = [
            {"$unwind": "$spoken_languages"},  # Rozwijamy tablicę 'spoken_language'
            {"$group": {
                "_id": "$spoken_languages.iso_639_1",  # Grupujemy po iso_639_1
                "count": {"$sum": 1}  # Zliczamy filmy w każdym języku
            }},
            {"$sort": {"count": -1}}  # Sortowanie po liczbie filmów (malejąco)
        ]
        languages_count_cursor = movies_collection.aggregate(pipeline)
        languages_counts = {doc["_id"]: doc["count"] for doc in await languages_count_cursor.to_list(length=None)}
        if not languages_counts:
            raise HTTPException(status_code=404, detail="No languages found")
        return languages_counts
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching languages count: {str(e)}")

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
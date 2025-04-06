from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from models import MovieModel
from db import collection
router = APIRouter()

@router.get("/language/{lang_code}", response_model=list[MovieModel])
async def get_movies_by_language(lang_code: str):
    try:
        query = {"spoken_languages.iso_639_1": lang_code}
        movies = collection.find(query)

        if not movies:
            raise HTTPException(status_code=404, detail="No movies found with that language")

        return list(movies)

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")

@router.get("/{movie_id}", response_model=MovieModel)
async def get_movie_by_id(movie_id: int):
    movie_data = collection.find_one({"movie_id": movie_id})
    if not movie_data:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Dokumenty z MongoDB ma pole _id, które trzeba usunac, aby dopasowac do MovieModel, aczkolwiek bez tego tez dziala
    # movie_data.pop("_id", None)
    return movie_data
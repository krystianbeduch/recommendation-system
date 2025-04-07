from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from models import MovieModel
from db import movies_collection
from typing import List
from abc_algorithm import main as run_abc_algorithm
router = APIRouter()

@router.get("/recommended/{user_id}", response_model=list[dict])
async def get_recommended_movies(user_id: int):
    """
    Endpoint zwracający rekomendowane filmy dla użytkownika na podstawie algorytmu ABC.
    """
    try:
        # Wywołanie algorytmu ABC
        print(f"Wywołano rekomendacje dla user_id = {user_id}")
        recommended_movies = await run_abc_algorithm(user_id)
        return recommended_movies

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/language/{lang_code}", response_model=list[MovieModel])
async def get_movies_by_language(lang_code: str):
    try:
        query = {"spoken_languages.iso_639_1": lang_code}
        movies_cursor = movies_collection.find(query)

        # Asynchronicznie konwertuje kursor na listę
        # Podejscie asnyc for lepsze dla duzych zbiorow danych
        movies = [movie async for movie in movies_cursor]

        if not movies:
            raise HTTPException(status_code=404, detail=f"No movies found with language code {lang_code}")
        return movies

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")

@router.get("/{movie_id}", response_model=MovieModel)
async def get_movie_by_id(movie_id: int):
    movie_data = await movies_collection.find_one({"movie_id": movie_id})
    if not movie_data:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie_data
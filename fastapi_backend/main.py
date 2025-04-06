from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pymongo.errors import PyMongoError
from typing import List

from db import movies_collection

from data_process import Movie, process_data
from models import MovieModel, Genre
from routes.movies_router import router as movies_router
from routes.users_router import router as users_router
from routes.mapping_router import router as mapping_router

app = FastAPI() # FastAPI init

origins = [
    "http://localhost:5173",  # React - 3000, React Vite - 5173
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Lista dozwolonych domen
    allow_credentials=True,
    allow_methods=["*"],  # Można ograniczyć metody do określonych, np. ["GET", "POST"]
    allow_headers=["*"],  # Można ograniczyć do określonych nagłówków, np. ["Authorization"]
)

app.include_router(movies_router, prefix="/api/movies")
app.include_router(users_router, prefix="/api/users")
app.include_router(mapping_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "FastAPI + MongoDB Atlas worked"}


@app.post("/movies")
async def add_movie(movie: MovieModel):
    try:
        movie_dict = movie.dict()
        result = await movies_collection.insert_one(movie_dict)
        return {"message": "Movie added successfully", "movie_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


# @app.get("/api/genres", response_model=list[Genre])
# async def get_genres():
#     try:
#         genres = list(genres_collection.find({}, {"_id": 0}))  # Pobiera wszystkie dokumenty, bez _id
#         if not genres:
#             raise HTTPException(status_code=404, detail="No genres found")
#         return genres
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")
#
# # Pobierz języki z MongoDB
# @app.get("/api/languages", response_model=List[Language])
# async def get_languages():
#     try:
#         languages = list(languages_collection.find({}, {"_id": 0}))  # Pobiera wszystkie dokumenty, bez _id
#         if not languages:
#             raise HTTPException(status_code=404, detail="No languages found")
#         return languages
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching languages: {str(e)}")


def send_movie(movies: list['Movie']):
    try:
        # Pzeksztalcenie listy obiektow na liste slownikow
        movie_dicts = [movie.to_dict() for movie in movies]

        # Wstawienie wszystkich dokumentow naraz
        movies_collection.insert_many(movie_dicts)
        print("Movies added successfully")

        return {"message": "Movies added successfully"}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")



# if __name__ == "__main__":
try:
    # 2 linijki do przygotowania bazy z pliku CSV
    movies = process_data()
    # send_movie(movies)
    print("s")
except Exception as e:
    print("exc: ", e)

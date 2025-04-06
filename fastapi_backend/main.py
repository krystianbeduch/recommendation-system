from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pymongo.errors import PyMongoError
from typing import List

from db import collection

from data_process import process_data, Movie
from models import MovieModel
from movies_router import router as movies_router

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

@app.get("/")
async def root():
    return {"message": "FastAPI + MongoDB Atalas worked"}


@app.post("/movies")
async def add_movie(movie: MovieModel):
    try:
        movie_dict = movie.dict()
        result = await collection.insert_one(movie_dict)
        return {"message": "Movie added successfully", "movie_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


def send_movie(movies: List['Movie']):
    try:
        # Pzeksztalcenie listy obiektow na liste slownikow
        movie_dicts = [movie.to_dict() for movie in movies]

        # Wstawienie wszystkich dokumentow naraz
        collection.insert_many(movie_dicts)
        print("Movies added successfully")

        return {"message": "Movies added successfully"}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")



# if __name__ == "__main__":
try:
    # 2 linijki do przygotowania bazy z pliku CSV
    # movies = process_data()
    # send_movie(movies)
    print("s")
except Exception as e:
    print("exc: ", e)

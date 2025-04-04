from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import PyMongoError
from typing import List, Dict

# from models import Movie
from data_process import process_data, Movie
from models import MovieModel
app = FastAPI() # FastAPI init

# Polaczenie z MongoDB Atlas
MONGO_URI = "mongodb+srv://beduchkrystian:TjAIArR5INK88Dvu@movies.qtlrs2a.mongodb.net/?retryWrites=true&w=majority&appName=movies"
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

db = client["recommendations"]
collection = db["movies"]

# try:
#     client.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print("Exception", e)


# class Movie(BaseModel):
#     title: str
#     genre: str
#     year: str


@app.get("/")
async def root():
    return {"message": "FastAPI + MongoDB Atalas worked"}

@app.get("/movies")
async def get_movies():
    movies = await collection.find()
    return {"movies": movies}

@app.post("/movies")
async def add_movie(movie: MovieModel):
    try:
        movie_dict = movie.dict()
        result = collection.insert_one(movie_dict)
        return {"message": "Movie added successfully", "movie_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")


def send_movie(movies: List['Movie']):
    try:
        for movie in movies:
            # movie_model = MovieModel(**movie.to_dict())
            movie_dict = movie.to_dict()

            result = collection.insert_one(movie_dict)
            print("Movie added successfully: ", result)
        return {"message": "Movie added successfully", "movies": movies}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Mongo error: {str(e)}")

# if __name__ == "__main__":
try:
    movies = process_data()
    movie = movies[0:10]
    # for x in movie:
    #     print(x)
    send_movie(movies)
except Exception as e:
    print("exc: ", e)

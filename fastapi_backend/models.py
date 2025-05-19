from bson import ObjectId
from pydantic import BaseModel
from typing import Optional

class Genre(BaseModel):
    id: int
    name: str

class SpokenLanguage(BaseModel):
    iso_639_1: str
    name: str
    count: int

class ProductionCompany(BaseModel):
    id: int
    name: str

class ProductionCountry(BaseModel):
    iso_3166_1: str
    name: str

class MovieModel(BaseModel):
    movie_id: int
    title: str
    genres: list[Genre]
    vote_average: float
    vote_count: int
    popularity: float
    spoken_languages: list[SpokenLanguage]
    original_language: str
    runtime: int
    budget: int
    imdb_id: str
    overview: str
    poster_path: str
    production_companies: list[ProductionCompany]
    production_countries: list[ProductionCountry]
    release_date: str
    revenue: int
    _id: Optional[str] = None

    class Config:
        json_encoders = {
            ObjectId: str
        }


class UserModel(BaseModel):
    userId: int
    username: str
    favoriteGenres: list[int]
    languagePreferences: list[str]

class CreateUserRequest(BaseModel):
    username: str
    favorite_genres: list[int]
    language_preferences: list[str]

class UserRateMovieRequest(BaseModel):
    user_id: int
    movie_id: int
    rating: float
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional


class Genre(BaseModel):
    id: int
    name: str

class SpokenLanguage(BaseModel):
    iso_639_1: str
    name: str

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
    _id: Optional[str] = None  # Dodatkowy typ dla _id (opcjonalny, bo nie zawsze będzie obecny w odpowiedzi)

    class Config:
        # Konwertuje ObjectId na string, co jest bardziej przyjazne w JSONie
        json_encoders = {
            ObjectId: str
        }


class UserModel(BaseModel):
    user_id: int
    username: str
    favoriteGenres: list[int]
    languagePreferences: list[str]

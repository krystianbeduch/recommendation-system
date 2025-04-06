from pydantic import BaseModel
from typing import List

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
    genres: List[Genre]
    vote_average: float
    vote_count: int
    popularity: float
    spoken_languages: List[SpokenLanguage]
    original_language: str
    runtime: int
    budget: int
    imdb_id: str
    overview: str
    poster_path: str
    production_companies: List[ProductionCompany]
    production_countries: List[ProductionCountry]
    release_date: str
    revenue: int
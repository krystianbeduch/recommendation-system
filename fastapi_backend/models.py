from pydantic import BaseModel
from typing import List, Dict

class MovieModel(BaseModel):
    movie_id: int
    title: str
    genres: List[Dict[str, str]]
    vote_average: float
    vote_count: int
    popularity: float
    spoken_languages: List[Dict[str, str]]
    original_language: str
    runtime: int
    budget: int
    imdb_id: str
    overview: str
    poster_path: str
    production_companies: List[Dict[str, str]]
    production_countries: List[Dict[str, str]]
    release_date: str
    revenue: int

    class Config:
        schema_extra = {
            "example": {
                "movie_id": 123,
                "title": "Example Movie",
                "genres": [{"id": 18, "name": "Drama"}],
                "vote_average": 7.5,
                "vote_count": 1500,
                "popularity": 123.45,
                "spoken_languages": [{"en": "English"}],
                "original_language": "en",
                "runtime": 120,
                "budget": 100000000,
                "imdb_id": "tt1234567",
                "overview": "This is a sample overview.",
                "poster_path": "/poster.jpg",
                "production_companies": [{"id": 1, "name": "Sample Studio"}],
                "production_countries": [{"iso_3166_1": "US", "name": "United States"}],
                "release_date": "2023-04-04",
                "revenue": 500000000
            }
        }
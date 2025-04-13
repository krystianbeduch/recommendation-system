from typing import List, Dict
import numpy as np
from db import users_collection, movies_collection, genres_collection, languages_collection
from routes.languages_router import get_all_languages_codes
from routes.genres_router import get_all_genres_id
from routes.users_router import get_user_preferences
from bson import ObjectId
from scipy.stats import spearmanr

def generate_features(genres: List[int], languages: List[str],
                      all_genres: List[int], all_languages: List[str],
                      genre_weight: float = 2.0, language_weight: float = 1.0) -> List[float]:
    """
    Generuje wektor cech jako: [for każdy gatunek: genre_weight jeśli gatunek występuje, 0 w przeciwnym razie] +
                              [for każdy język: language_weight jeśli język występuje, 0 w przeciwnym razie]
    """
    genre_vector = [genre_weight if genre in genres else 0 for genre in all_genres]
    language_vector = [language_weight if language in languages else 0 for language in all_languages]
    return genre_vector + language_vector

class ArtificialBeeColony:
    def __init__(self, movies: List[Dict], user_preferences: Dict, all_genres: List[int], all_languages: List[str]):
        self.movies = movies
        self.user_preferences = user_preferences
        self.all_genres = all_genres
        self.all_languages = all_languages

        # Parametry algorytmu – można dostosować
        self.population_size = 50
        self.max_iterations = 10   
        self.scout_limit = 30
        # Wektor cech filmu: gatunki + języki + 1 dla oceny
        self.dim = len(all_genres) + len(all_languages) + 1

    def compute_features(self, movie: Dict) -> np.ndarray:
        """
        Generuje wektor cech filmu: składowe cech to – zakodowane gatunki i język oraz znormalizowana ocena.
        Ocena zostaje przeskalowana (np. wagą 0.2).
        """
        base_features = generate_features(
            movie["genres"],
            [movie["language"]],
            self.all_genres,
            self.all_languages,
            genre_weight=2.0,
            language_weight=1.0
        )
        rating_feature = movie.get("normalized_rating", 0) * 0.2  # mniejsza waga dla oceny
        features = base_features + [rating_feature]
        return np.array(features)

    def compute_user_preference_vector(self) -> np.ndarray:
        """
        Generuje wektor preferencji użytkownika przy użyciu tych samych wag.
        Dodajemy stałą wartość (0.2) dla "oceny", aby wymiar się zgadzał.
        """
        base_preferences = generate_features(
            self.user_preferences.get("favouriteGenres", []),
            self.user_preferences.get("languagePreferences", []),
            self.all_genres,
            self.all_languages,
            genre_weight=2.0,
            language_weight=1.0
        )
        return np.array(base_preferences + [0.2])

    def compute_predictions(self, weights: np.ndarray) -> np.ndarray:
        """
        Oblicza przewidywane "oceny" dla wszystkich filmów jako iloczyn skalarny wag i wektora cech filmu.
        """
        predictions = []
        for movie in self.movies:
            features = self.compute_features(movie)
            pred = np.dot(weights, features)
            predictions.append(pred)
        return np.array(predictions)

    def objective_function(self, weights: np.ndarray) -> float:
        """
        Funkcja celu – dopasowujemy filmy do profilu użytkownika.
        Porównujemy wartość predykcji (dot(weights, features)) z miarą podobieństwa filmu
        do wektora preferencji użytkownika.
        Korzystamy z korelacji Spearmana – im wyższa korelacja, tym lepsze dopasowanie.
        """
        predictions = self.compute_predictions(weights)
        user_vector = self.compute_user_preference_vector()
        movie_similarities = np.array([
            np.dot(self.compute_features(movie), user_vector) 
            for movie in self.movies
        ])
        if np.std(predictions) == 0 or np.std(movie_similarities) == 0:
            return 1.0
        corr, _ = spearmanr(predictions, movie_similarities)
        return -corr  # negatywna wartość – minimalizacja funkcji celu

    def initialize_population(self) -> np.ndarray:
        """Inicjalizuje populację rozwiązań (wektorów wag) losowo w zakresie [0, 1]."""
        return np.random.rand(self.population_size, self.dim)

    def generate_new_solution(self, solution: np.ndarray, population: np.ndarray) -> np.ndarray:
        """Generuje nowe rozwiązanie na podstawie danego rozwiązania i losowo wybranego innego z populacji."""
        k = np.random.randint(0, self.population_size)
        while np.array_equal(solution, population[k]):
            k = np.random.randint(0, self.population_size)
        j = np.random.randint(0, self.dim)
        phi = np.random.uniform(-1, 1)
        candidate = solution.copy()
        candidate[j] = candidate[j] + phi * (candidate[j] - population[k][j])
        candidate = np.clip(candidate, 0, 1)
        return candidate

    def employee_phase(self, population: np.ndarray, fitness: np.ndarray, trial: np.ndarray):
        """Faza pszczół robotnic – modyfikacja rozwiązań."""
        for i in range(self.population_size):
            candidate = self.generate_new_solution(population[i], population)
            candidate_fitness = self.objective_function(candidate)
            if candidate_fitness < fitness[i]:
                population[i] = candidate
                fitness[i] = candidate_fitness
                trial[i] = 0
            else:
                trial[i] += 1

    def onlooker_phase(self, population: np.ndarray, fitness: np.ndarray, trial: np.ndarray):
        """Faza pszczół obserwujących – wybór rozwiązań na podstawie prawdopodobieństwa."""
        prob = (1 / (1 + fitness)) / np.sum(1 / (1 + fitness))
        i = 0
        t = 0
        while t < self.population_size:
            if np.random.rand() < prob[i]:
                t += 1
                candidate = self.generate_new_solution(population[i], population)
                candidate_fitness = self.objective_function(candidate)
                if candidate_fitness < fitness[i]:
                    population[i] = candidate
                    fitness[i] = candidate_fitness
                    trial[i] = 0
                else:
                    trial[i] += 1
            i = (i + 1) % self.population_size

    def scout_phase(self, population: np.ndarray, fitness: np.ndarray, trial: np.ndarray):
        """Faza pszczół zwiadowczych – zastąpienie rozwiązań, które przez długi czas nie uległy poprawie."""
        for i in range(self.population_size):
            if trial[i] > self.scout_limit:
                population[i] = np.random.rand(self.dim)
                fitness[i] = self.objective_function(population[i])
                trial[i] = 0

    def optimize(self) -> np.ndarray:
        """Główna metoda optymalizacji – zwraca optymalny wektor wag."""
        population = self.initialize_population()
        fitness = np.array([self.objective_function(ind) for ind in population])
        trial = np.zeros(self.population_size)
        best_index = np.argmin(fitness)
        best_solution = population[best_index]
        best_fitness = fitness[best_index]

        print("Inicjalizacja zakończona. Start optymalizacji...")

        for iteration in range(self.max_iterations):
            print(f"Iteracja {iteration}: najlepszy wynik = {best_fitness:.4f}")
            self.employee_phase(population, fitness, trial)
            self.onlooker_phase(population, fitness, trial)
            self.scout_phase(population, fitness, trial)

            current_best_index = np.argmin(fitness)
            if fitness[current_best_index] < best_fitness:
                best_fitness = fitness[current_best_index]
                best_solution = population[current_best_index]
                print(f"Nowe najlepsze rozwiązanie znalezione w iteracji {iteration}: {best_fitness:.4f}")

        print("Optymalizacja zakończona.")
        return best_solution

# Funkcja pobierająca filmy z MongoDB wraz z normalizacją ocen
async def get_movies() -> List[Dict]:
    movies_cursor = movies_collection.find({})
    movies = await movies_cursor.to_list(length=1000)
    
    ratings = [movie.get("vote_average", 0) for movie in movies]
    min_rating, max_rating = min(ratings), max(ratings)
    
    transformed_movies = []
    for movie in movies:
        if max_rating != min_rating:
            normalized = (movie.get("vote_average", 0) - min_rating) / (max_rating - min_rating)
        else:
            normalized = movie.get("vote_average", 0)
        transformed_movies.append({
            "id": str(movie["_id"]),
            "movie_id": movie.get("movie_id"),
            "title": movie.get("title", ""),
            "genres": movie.get("genres", []),
            "language": movie.get("original_language", ""),
            "spoken_languages": movie.get("spoken_languages", []),
            "rating": movie.get("vote_average", 0),
            "normalized_rating": normalized,
            "poster_path": movie.get("poster_path", ""),
            "release_date": movie.get("release_date", ""),
        })
    return transformed_movies

async def main(user_id: int) -> list[dict]:
    """Uruchamia algorytm ABC i zwraca rekomendowane filmy."""
    user_preferences = await get_user_preferences(user_id)
    movies = await get_movies()

    all_genres = await get_all_genres_id()
    all_languages = await get_all_languages_codes()

    print("DEBUG: Wszystkie gatunki filmowe (all_genres):", all_genres)
    print("DEBUG: Preferowane gatunki użytkownika (favouriteGenres):", user_preferences.get("favouriteGenres", []))

    abc = ArtificialBeeColony(movies, user_preferences, all_genres, all_languages)
    best_weights = abc.optimize()

    predictions = abc.compute_predictions(best_weights)
    sorted_indices = np.argsort(-predictions)
    recommended_movies = [movies[i] for i in sorted_indices[:10]]

    return recommended_movies

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 

from typing import List, Dict
import numpy as np
from db import users_collection, movies_collection, genres_collection, languages_collection
from bson import ObjectId
from scipy.stats import pearsonr

# Globalne zmienne na listę gatunków i języków
all_genres = []
all_languages = []

def generate_features(genres: List[int], languages: List[str], all_genres: List[int], all_languages: List[str]) -> List[int]:
    """Generuje wektor cech na podstawie ID gatunków i języków."""
    genre_vector = [1 if genre in genres else 0 for genre in all_genres]
    language_vector = [1 if language in languages else 0 for language in all_languages]
    return genre_vector + language_vector

class ArtificialBeeColony:
    def __init__(self, movies: List[Dict], user_preferences: Dict, actual_ratings: np.ndarray):
        self.movies = movies
        self.user_preferences = user_preferences
        self.actual_ratings = actual_ratings  # Rzeczywiste oceny filmów
        self.population_size = 50    # Rozmiar populacji (wektory wag)
        self.max_iterations = 100     # Maksymalna liczba iteracji
        self.scout_limit = 15         # Limit prób dla pszczół zwiadowczych
        # Wektor wag ma długość = liczba cech (gatunki + języki)
        self.dim = len(all_genres) + len(all_languages)

    def compute_features(self, movie: Dict) -> np.ndarray:
        """Generuje wektor cech filmu na podstawie ID gatunków i języka."""
        return np.array(generate_features(
            movie["genres"],
            [movie["language"]],
            all_genres,
            all_languages
        ))

    def compute_predictions(self, weights: np.ndarray) -> np.ndarray:
        """Oblicza przewidywane oceny dla wszystkich filmów jako iloczyn skalarny wag i wektora cech filmu."""
        predictions = []
        for movie in self.movies:
            features = self.compute_features(movie)
            pred = np.dot(weights, features)
            predictions.append(pred)
        return np.array(predictions)

    def objective_function(self, weights: np.ndarray) -> float:
        """
        Funkcja celu – celem jest maksymalizacja dopasowania między przewidywanymi a rzeczywistymi ocenami.
        Obliczamy współczynnik korelacji Pearsona i zwracamy jego ujemną wartość (aby minimalizacja odpowiadała maksymalizacji korelacji).
        """
        predictions = self.compute_predictions(weights)
        if np.std(predictions) == 0 or np.std(self.actual_ratings) == 0:
            return 1.0 
        corr, _ = pearsonr(predictions, self.actual_ratings)
        return -corr

    def initialize_population(self) -> np.ndarray:
        """Inicjalizuje populację jako macierz wektorów wag (losowo w zakresie [0,1])."""
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

    def get_best_solutions(self, population: np.ndarray) -> np.ndarray:
        """Zwraca 10 najlepszych rozwiązań z populacji."""
        sorted_indices = np.argsort([self.objective_function(ind) for ind in population])
        return population[sorted_indices][:10]

# Funkcje do pobierania danych z MongoDB
async def get_user_preferences(user_id: str) -> Dict:
    """Pobiera preferencje użytkownika z bazy MongoDB."""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError(f"Użytkownik o ID {user_id} nie został znaleziony.")
        return {
            "favouriteGenres": user.get("favoriteGenres", []),
            "languagePreferences": user.get("languagePreferences", [])
        }
    except Exception as e:
        raise ValueError(f"Błąd podczas pobierania użytkownika: {str(e)}")

async def get_movies() -> List[Dict]:
    """Pobiera listę filmów z bazy MongoDB i przekształca strukturę dokumentów do postaci wykorzystywanej w algorytmie."""
    movies_cursor = movies_collection.find({})
    movies = await movies_cursor.to_list(length=1000)
    return [
        {
            "id": movie["_id"],
            "movie_id": movie.get("movie_id"),
            "title": movie.get("title", ""),
            # Przekształcamy tablicę obiektów 'genres' na listę ID
            "genres": [g["id"] for g in movie.get("genres", [])],
            # Używamy 'original_language' jako języka filmu
            "language": movie.get("original_language", ""),
            # Używamy 'vote_average' jako rating
            "rating": movie.get("vote_average", 0)
        }
        for movie in movies
    ]

async def get_all_genres() -> List[int]:
    """Pobiera listę wszystkich ID gatunków z bazy MongoDB."""
    genres_cursor = genres_collection.find({})
    genres = await genres_cursor.to_list(length=1000)
    return [genre["id"] for genre in genres]

async def get_all_languages() -> List[str]:
    """Pobiera listę wszystkich kodów języków z bazy MongoDB."""
    languages_cursor = languages_collection.find({})
    languages = await languages_cursor.to_list(length=1000)
    return [language["iso_639_1"] for language in languages]


async def main(user_id: str):
    print(f"Rozpoczęcie algorytmu dla użytkownika {user_id}...")
    user_preferences = await get_user_preferences(user_id)
    print("Pobrano preferencje użytkownika.")
    movies = await get_movies()
    print(f"Pobrano {len(movies)} filmów z bazy danych.")

    global all_genres, all_languages
    all_genres = await get_all_genres()
    all_languages = await get_all_languages()
    print(f"Pobrano {len(all_genres)} gatunków i {len(all_languages)} języków.")

    actual_ratings = np.array([movie["rating"] for movie in movies])
    abc = ArtificialBeeColony(movies, user_preferences, actual_ratings)
    print("Rozpoczęcie optymalizacji...")
    best_weights = abc.optimize()
    print("Optymalizacja zakończona.")
    predictions = abc.compute_predictions(best_weights)
    sorted_indices = np.argsort(-predictions)
    recommended_movies = [movies[i] for i in sorted_indices[:10]]
    print("Rekomendacje wygenerowane.")
    return recommended_movies

# Uruchomienie algorytmu
# async def main():
#     user_id = "67f2f9ae63e18c895144d61e"  # ID użytkownika z bazy
#     user_preferences = await get_user_preferences(user_id)
#     movies = await get_movies()

#     global all_genres, all_languages
#     all_genres = await get_all_genres()
#     all_languages = await get_all_languages()

#     # Utwórz tablicę z rzeczywistymi ocenami dla filmów
#     actual_ratings = np.array([movie["rating"] for movie in movies])
    
#     # Tworzenie instancji algorytmu ABC i uruchomienie optymalizacji wag
#     abc = ArtificialBeeColony(movies, user_preferences, actual_ratings)
#     best_weights = abc.optimize()
#     print("Optymalne wagi:", best_weights)
    
#     # Użyj optymalnych wag do generowania przewidywanych ocen i rekomendacji
#     predictions = abc.compute_predictions(best_weights)
#     sorted_indices = np.argsort(-predictions)
#     recommended_movies = [movies[i] for i in sorted_indices[:10]]
#     print("Rekomendowane filmy:")
#     for i in sorted_indices[:10]:
#         movie = movies[i]
#         print(f"{movie['title']} — predicted score: {predictions[i]:.2f}, TMDB rating: {movie.get('rating', 0)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

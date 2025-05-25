from typing import List, Dict
import numpy as np
from db import movies_collection
from routes.languages_router import get_all_languages_codes
from routes.genres_router import get_all_genres_id
from routes.users_router import get_user_preferences
from scipy.stats import spearmanr

def generate_features(genres: List, languages: List[str],
                      all_genres: List[int], all_languages: List[str]) -> List[int]:
    if genres and isinstance(genres[0], dict):
        genre_ids = [g['id'] for g in genres]
    else:
        genre_ids = genres

    genre_vector = [1 if genre in genre_ids else 0 for genre in all_genres]
    language_vector = [1 if lang in languages else 0 for lang in all_languages]
    # debug
    # if genres or languages:
    #     print(f"GENRES: {genres}")
    #     print(f"LANGUAGES: {languages}")

    return genre_vector + language_vector

class ArtificialBeeColony:
    def __init__(self, movies: List[Dict], user_preferences: Dict,
                 relevant_genres: List[int], relevant_languages: List[str]):
        self.movies = movies
        self.user_preferences = user_preferences
        self.relevant_genres = relevant_genres
        self.relevant_languages = relevant_languages

        # Parametry algorytmu
        self.population_size = 100
        # self.max_iterations = 10
        self.max_iterations = 10
        self.scout_limit = 5
        # Wymiar zależy od długości list relewantnych cech + 1 dla oceny
        self.dim = len(self.relevant_genres) + len(self.relevant_languages) + 1
        print(f"Inicjalizacja ABC. Wymiar przestrzeni cech (dim): {self.dim}")

    def compute_features(self, movie: Dict) -> np.ndarray:
        base_features = generate_features(
            movie["genres"],
            [movie["language"]],
            self.relevant_genres,
            self.relevant_languages
        )
        # Obniżenie normalized_rating dla filmów z małą liczbą ocen (np. <100)
        rating = movie.get("normalized_rating", 0)
        vote_count = movie.get("vote_count", 0)
        if vote_count < 100:
            # Obniżamy wagę oceny, aby nie wpływała zbytnio na rekomendacje
            rating *= 0.5  

        features = base_features + [rating]
        return np.array(features)

    def compute_user_preference_vector(self) -> np.ndarray:
        """
        Generuje wektor preferencji użytkownika, używając tylko relewantnych cech.
        Dla oceny filmu przyjmujemy wartość 1.
        """
        base_preferences = generate_features(
            self.user_preferences.get("favouriteGenres", []),
            self.user_preferences.get("languagePreferences", []),
            self.relevant_genres,      
            self.relevant_languages    
        )
        return np.array(base_preferences + [1])

    def compute_predictions(self, weights: np.ndarray) -> np.ndarray:
        """
        Oblicza przewidywane oceny dla wszystkich filmów jako iloczyn
        skalarny wag i wektora cech filmu.
        """
        predictions = []
        for movie in self.movies:
            features = self.compute_features(movie)
            pred = np.dot(weights, features)
            predictions.append(pred)
        return np.array(predictions)

    def objective_function(self, weights: np.ndarray) -> float:
        """
        Funkcja celu – optymalizujemy dopasowanie rekomendacji do profilu użytkownika.
        Obliczamy podobieństwo filmu do profilu użytkownika (tj. jak bardzo film pasuje 
        do ulubionych gatunków, preferowanych języków ORAZ jakie ma oceny) i staramy się, 
        aby przewidywane wyniki (wynik iloczynu wag i cech) były z nim skorelowane.
        """
        predictions = self.compute_predictions(weights)
        user_vector = self.compute_user_preference_vector()
        # Dla każdego filmu obliczamy kombinację: podobieństwo do profilu + dodatkowo informację o ocenie
        movie_similarities = np.array([
            np.dot(self.compute_features(movie), user_vector) 
            for movie in self.movies
        ])
        if np.std(predictions) == 0 or np.std(movie_similarities) == 0:
            return 1.0
        corr, _ = spearmanr(predictions, movie_similarities)
        return -corr  # Negatywna wartość dla minimalizacji

    def initialize_population(self) -> np.ndarray:
        """Inicjalizuje populację jako macierz wektorów wag (losowo w zakresie [0,1])."""
        return np.random.rand(self.population_size, self.dim)

    def generate_new_solution(self, solution: np.ndarray, population: np.ndarray) -> np.ndarray:
        """
        Generuje nowe rozwiązanie na podstawie danego rozwiązania i losowo wybranego innego z populacji.
        """
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
        """Faza pszczół robotnic – modyfikacja rozwiązań.
            Dla każdego rozwiązania generuje nową kandydatkę poprzez mutację (losowa zmiana jednego wymiaru).
        """
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
        # Dodajemy mały epsilon, aby uniknąć dzielenia przez zero, gdy fitness = -1.0
        epsilon = 1e-9
        # Obliczamy "jakość" - im niższy fitness (bliżej -1.0), tym wyższa jakość
        # Używamy max(0, ...) aby uniknąć problemów z fitness > -1
        quality = 1 / (1 + fitness + epsilon) 
        
        total_quality = np.sum(quality)

        # Jeśli suma jakości jest bliska zeru lub jeśli wszystkie
        # fitness są takie same (np. wszystkie -1.0), przypisz równe prawdopodobieństwo
        if total_quality < epsilon or np.all(fitness == fitness[0]):
             prob = np.ones(self.population_size) / self.population_size
        else:
            prob = quality / total_quality

        selected_indices = np.random.choice(range(self.population_size), size=self.population_size, p=prob)

        for i in selected_indices: 
            candidate = self.generate_new_solution(population[i], population)
            candidate_fitness = self.objective_function(candidate)
            if candidate_fitness < fitness[i]:
                population[i] = candidate
                fitness[i] = candidate_fitness
                trial[i] = 0

    def scout_phase(self, population: np.ndarray, fitness: np.ndarray, trial: np.ndarray):
        """
        Faza pszczół zwiadowczych – zastąpienie rozwiązań, które przez długi czas nie uległy poprawie.
        """
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

# Funkcja pobierania danych z MongoDB
async def get_movies() -> List[Dict]:

    sample_size = 3000 # Liczba filmów do pobrania z bazy
    pipeline = [
        {"$sample": {"size": sample_size}}
    ]
    movies_cursor = movies_collection.aggregate(pipeline)
    # Pobieramy wszystkie wyniki z kursora agregacji (już ograniczone przez $sample)
    movies = await movies_cursor.to_list(length=None) 

    if not movies:
        return [] # Zwróć pustą listę, jeśli $sample nic nie znalazło 

    # Wyliczamy min i max oceny (vote_average) dla normalizacji
    # Używamy tylko filmów, które mają ocenę
    ratings = [movie.get("vote_average", 0) for movie in movies if movie.get("vote_average") is not None]
    if not ratings: # Obsługa przypadku, gdy żaden z wylosowanych filmów nie ma oceny
        min_rating, max_rating = 0, 0
    else:
        min_rating, max_rating = min(ratings), max(ratings)
    
    # Przekształcamy dokumenty i dodajemy pole "normalized_rating"
    transformed_movies = []
    for movie in movies:
        rating = movie.get("vote_average", 0)
        normalized = 0
        # Obsługa dzielenia przez zero, jeśli wszystkie oceny są takie same
        if max_rating > min_rating:
            normalized = (rating - min_rating) / (max_rating - min_rating)
        elif max_rating > 0: # Jeśli max == min, ale nie zero, normalizuj do 1.0
             normalized = 1.0
        # else: normalized pozostaje 0, jeśli min=max=0

        transformed_movies.append({
            "id": str(movie["_id"]),
            "movie_id": movie.get("movie_id"),
            "title": movie.get("title", ""),
            "genres": movie.get("genres", []),
            "language": movie.get("original_language", ""),
            "spoken_languages": movie.get("spoken_languages", []),
            "rating": rating,
            "vote_count": movie.get("vote_count", 0),
            "normalized_rating": normalized, 
            "poster_path": movie.get("poster_path", ""),
            "release_date": movie.get("release_date", ""),
        })
    return transformed_movies

async def main(user_id: int) -> list[dict]:
    print(f"Wywołano rekomendacje dla user_id = {user_id}")

    user_preferences = await get_user_preferences(user_id)
    print(">> Preferencje użytkownika:")
    user_fav_genres = user_preferences.get("favouriteGenres", [])
    user_pref_langs = user_preferences.get("languagePreferences", [])
    print("   favouriteGenres:", user_fav_genres)
    print("   languagePreferences:", user_pref_langs)

    movies = await get_movies()
    if not movies:
        print("Nie znaleziono filmów w bazie.")
        return []
    print(f">> Liczba filmów w bazie: {len(movies)}")

    # Pobierz gatunki i języki z bazy
    all_genres_full = await get_all_genres_id()
    all_languages_full = await get_all_languages_codes()

    # --- Filtrowanie list cech ---
    # Jeśli użytkownik ma preferencje gatunków, użyj ich; inaczej użyj wszystkich
    relevant_genres = user_fav_genres if user_fav_genres else all_genres_full
    # Jeśli użytkownik ma preferencje językowe, użyj ich; inaczej użyj wszystkich
    relevant_languages = user_pref_langs if user_pref_langs else all_languages_full

    relevant_genres = sorted(list(set(relevant_genres)))
    relevant_languages = sorted(list(set(relevant_languages)))

    print(">> Używane gatunki (ID):", relevant_genres)
    print(">> Używane języki:", relevant_languages)

    # Przekaż przefiltrowane listy do konstruktora ABC
    abc = ArtificialBeeColony(movies, user_preferences, relevant_genres, relevant_languages)
    best_weights = abc.optimize()

    predictions = abc.compute_predictions(best_weights)
    if len(predictions) != len(movies):
         print(f"Error: Mismatch in length between predictions ({len(predictions)}) and movies ({len(movies)})")
         return []

    sorted_indices = np.argsort(-predictions) 
    recommended_movies = [movies[i] for i in sorted_indices[:10]] # Top 10

    print(">> TOP 10 polecanych filmów:")
    for i, idx in enumerate(sorted_indices[:10]):
        m = movies[idx]
        score = predictions[idx]
        genre_names = [g.get('name', g.get('id', '?')) for g in m.get('genres', [])]
        print(f"  {i+1}. {m.get('title', 'N/A')} | Score: {score:.4f} | Genres: {genre_names} | Lang: {m.get('language', 'N/A')}")

    return recommended_movies

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

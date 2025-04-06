import ast
import csv
from typing import List, Dict
from chardet import detect
from collections import defaultdict
import re
import json

def convert_runtime_to_int(runtime_str):
    try:
        # Sprawdzamy, czy jest to liczba zmiennoprzecinkowa
        runtime = float(runtime_str)
        # Jeśli liczba ma część dziesiętną .0, zamieniamy ją na liczbę całkowitą
        if runtime.is_integer():
            return str(int(runtime))  # Zamieniamy na liczbę całkowitą
    except ValueError:
        pass  # Jeśli to nie jest liczba, pozostawiamy oryginalną wartość

    return runtime_str  # Zwracamy oryginalną wartość, jeśli nie jest floatem


class CSVFileProcessor:
    @staticmethod
    def convert_macroman_to_utf8(input_file, output_file):
        """Konwertuje plik z kodowania macroman na UTF-8, przy okazji przetwarza fromat średnich ocen"""
        with open(input_file, 'r', encoding='macroman', errors='replace') as src:
            with open(output_file, 'w', encoding='utf-8', errors='replace') as dest:
                content = src.read()
                updated_content = re.sub(r'\d{2}\.\w{3}', lambda match: CSVFileProcessor.convert_vote_avg_to_float(match.group(0)), content)
                # updated_content = re.sub(r'\d+\.\d+', lambda match: convert_runtime_to_int(match.group(0)), content)
                dest.write(updated_content)

                # dest.write(src.read())
        print(f"File {input_file} was converted to UTF-8 as {output_file}")

    @staticmethod
    def convert_vote_avg_to_float(date_str):
        """Konwertuje średnią ocene z formatu datowego na zmiennoprzecinkowy"""
        month_mapping = {
            'sty': 1, 'lut': 2, 'mar': 3, 'kwi': 4, 'maj': 5, 'cze': 6,
            'lip': 7, 'sie': 8, 'wrz': 9, 'paź': 10, 'lis': 11, 'gru': 12
        }

        # Sprawdzamy czy data jest w formacie dd.mmm, np. 07.lut
        match = re.match(r'(\d{2})\.(\w{3})', date_str)
        if match:
            day = int(match.group(1))
            month_str = match.group(2)
            month = month_mapping.get(month_str.lower(), 0)

            if month:
                return f"'{day}.{month}"
        return date_str

    @staticmethod
    def detect_encoding(filename):
        """Wykrywa kodowanie pliku przy użyciu biblioteki chardet"""
        with open(filename, 'rb') as f:
            result = detect(f.read())
            print(f"File encoding {filename}: {result['encoding']}")
            return result['encoding']

class LanguageLoader:
    def __init__(self, file_path: str):
        with open(file_path, 'r', encoding='utf-8') as f:
            self.language_map = json.load(f)


class Movie:
    language_map: Dict[str, str] = {}
    runtime_groups = {
        'Short Films (2-40 min)': (2, 40),
        'Medium-Length Films (41-70 min)': (41, 70),
        'Feature Films (71-150 min)': (71, 150),
        'Extended Feature Films (151-240 min)': (151, 240),
        'Epic Films (241-400 min)': (241, 400),
        'Marathon Films (401+ min)': (401, 1000),
    }

    @classmethod
    def load_language_map(cls, file_path: str):
        with open(file_path, 'r', encoding='utf-8') as f:
            cls.language_map = json.load(f)

    def __init__(self,
                 movie_id: int,
                 title: str,
                 genres: List[Dict[str, str]],
                 vote_average: float,
                 vote_count: int,
                 popularity: float,
                 spoken_languages: List[Dict[str, str]],
                 original_language: str,
                 runtime: int,
                 budget: int,
                 imdb_id: str,
                 overview: str,
                 poster_path: str,
                 production_companies: List[Dict[str, str]],
                 production_countries: List[Dict[str, str]],
                 release_date: str,
                 revenue: int
                 ):
        self.movie_id = movie_id
        self.title = title
        self.genres = genres
        self.vote_average = vote_average
        self.vote_count = vote_count
        self.popularity = popularity
        self.spoken_languages = [
            {
                "iso_639_1": lang["iso_639_1"],
                "name": Movie.language_map.get(lang['iso_639_1'], 'Unknown')
            }
            for lang in spoken_languages
        ]
        self.original_language = original_language
        self.runtime = runtime
        self.budget = budget
        self.imdb_id = imdb_id
        self.overview = overview
        self.poster_path = poster_path
        self.production_companies = production_companies
        self.production_countries = production_countries
        self.release_date = release_date
        self.revenue = revenue

        self.runtime_group = self.assign_runtime_group()

    def __str__(self):
        return (f"Movie( {self.movie_id}, {self.title}, {self.genres}, {self.vote_average}/10), "
                f"{self.vote_count}, {self.popularity}, {self.spoken_languages}, {self.original_language} "
                f"{self.runtime}")
        # return f"Movie {self.movie_id}, {self.title}, {self.overview}"

    def assign_runtime_group(self) -> str:
        """Przypisuje film do odpowiedniej grupy na podstawie czasu trwania"""
        for group_name, (min_runtime, max_runtime) in Movie.runtime_groups.items():
            if min_runtime <= self.runtime <= max_runtime:
                return group_name
        return 'Unknown Runtime'

    @staticmethod
    def update_movie_titles_and_overview(input_file: str, movie_list: List['Movie']) -> None:
        """Podmienia tytuły filmów oraz opis w obiektach Movie na te z oryginalnego pliku CSV (problemy z kodowaniem w zmienionym pliku)."""
        movie_ids_to_update = {movie.movie_id for movie in movie_list}
        original_titles = {}
        original_overviews = {}
        with open(input_file, mode='r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            for row in reader:
                try:
                    movie_id = int(row[5])
                    movie_name = row[20].strip()
                    movie_overview = row[9].strip()
                    if movie_id in movie_ids_to_update:
                        original_titles[movie_id] = movie_name
                        original_overviews[movie_id] = movie_overview
                except (IndexError, ValueError):
                    continue  # Pomijamy błędne wiersze

        # Aktualizacja nazw filmów w obiektach Movie
        for movie in movie_list:
            if movie.movie_id in original_titles:
                movie.title = original_titles[movie.movie_id]
                movie.overview = original_overviews[movie.movie_id]

    @staticmethod
    def list_genres_with_counts(movies: List['Movie']) -> None:
        """Wypisuje listę wszystkich gatunków z liczbą filmów w każdym z nich."""
        genre_count = defaultdict(int)  # Słownik, który liczy wystąpienia każdego gatunku
        print('-' * 100)
        for movie in movies:
            for genre in movie.genres:
                genre_count[genre.get('name')] += 1

        print('Number of films in each genre:')
        for genre, count in sorted(genre_count.items()):
            print(f"{genre}: {count} movies")
        print('-' * 100)

    @staticmethod
    def list_movies_in_genre(genre_name: str, movies: List['Movie']):
        """Zlicz filmy w danej kategorii (genre_name)"""
        count = 0
        print('-' * 100)
        print(f"Movies in genre '{genre_name}':")

        for movie in sorted(movies, key=lambda movie: movie.title.lower()):
            for genre in movie.genres:
                if genre.get('name').lower() == genre_name.lower():
                    count += 1
                    print(f"{movie.title} (ID: {movie.movie_id})")

        print(f"\nNumber of films in the category: '{genre_name}': {count}")
        print('-' * 100)

    @staticmethod
    def count_languages(movies: List['Movie']) -> None:
        """Zlicz języki w filmach (spoken_languages)"""
        language_count = defaultdict(int)
        print('-' * 100)

        for movie in movies:
            for lang in movie.spoken_languages:
                for lang_code, lang_name in lang.items():
                    language_count[lang_code] += 1

        for lang_code, count in sorted(language_count.items()):
            language_name = Movie.language_map.get(lang_code, 'Unknown Language')
            print(f"{lang_code} - {language_name}: {count} movies")
        print('-' * 100)

    @staticmethod
    def find_movies_by_language(movies: List['Movie'], language_code: str) -> None:
        """Wyświetl nazwy filmów na podstawie języka"""
        print('-' * 100)
        print(f"Movies available in '{Movie.language_map.get(language_code, 'Unknown Language')}' ({language_code}):")
        found_movies = False
        count = 0

        for movie in movies:
            for lang in movie.spoken_languages:
                for lang_code, lang_name in lang.items():
                    if lang_code == language_code:
                        print(f"{movie.title} (ID: {movie.movie_id})")
                        count += 1
                        found_movies = True

        if found_movies:
            print(f"\nNumber of movies in the language: '{language_code}': {count}")
        else:
            print(f"No movies found in language '{language_code}'")

        print('-' * 100)

    @staticmethod
    def show_runtime_statistics(movies: List['Movie']) -> None:
        """Wyświetla unikalne czasy trwania filmów i liczbę filmów o danym czasie (runtime)"""
        runtime_count = {}

        # Zliczanie wystąpień każdego czasu trwania
        for movie in movies:
            runtime = movie.runtime
            runtime_count[runtime] = runtime_count.get(runtime, 0) + 1

        # Wypisanie wyników
        for runtime, count in sorted(runtime_count.items()):
            print(f"{runtime} min: {count} movies")

    @staticmethod
    def show_movies_by_runtime_group(movies: List['Movie'], group_name: str) -> None:
        """Wyświetla filmy należące do podanej kategorii długości filmu"""
        filtered_movies = [movie for movie in movies if movie.runtime_group == group_name]

        print('-' * 100)
        if not filtered_movies:
            print(f"No movies found in category: {group_name}")
            return

        print(f"Movies in category '{group_name}':")
        for movie in filtered_movies:
            print(movie)
        print(f"\nNumber of films in category '{group_name}': {len(filtered_movies)}")
        print('-' * 100)

    def to_dict(self) -> Dict:
        """Zwraca reprezentację obiektu Movie jako słownik"""
        return {
            'movie_id': self.movie_id,
            'title': self.title,
            'genres': self.genres,
            'vote_average': self.vote_average,
            'vote_count': self.vote_count,
            'popularity': self.popularity,
            'spoken_languages': self.spoken_languages,
            'original_language': self.original_language,
            'runtime': self.runtime,
            'budget': self.budget,
            'imdb_id': self.imdb_id,
            'overview': self.overview,
            'poster_path': self.poster_path,
            'production_companies': self.production_companies,
            'production_countries': self.production_countries,
            'release_date': self.release_date,
            'revenue': self.revenue
        }

def parse_csv_to_movies(file_path: str) -> List['Movie']:
    movies = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter=';')
        next(reader)

        for row in reader:
            try:
                movie = Movie(
                    movie_id= int(row[0]),
                    title = row[1].strip(),
                    genres = ast.literal_eval(row[2]),
                    vote_average = float(row[3].strip().lstrip("'")),
                    vote_count = int(row[4]),
                    popularity = float(row[5]),
                    spoken_languages = ast.literal_eval(row[6]),
                    original_language = row[7].strip(),
                    runtime = int(row[8]),
                    budget = int(row[9]),
                    imdb_id = row[10].strip(),
                    overview = row[11].strip(),
                    poster_path = row[12].strip(),
                    production_companies = ast.literal_eval(row[13]),
                    production_countries = ast.literal_eval(row[14]),
                    release_date = row[15].strip(),
                    revenue = int(row[16])
                )
                movies.append(movie)
            except (ValueError, SyntaxError, IndexError) as e:
                print(f"Row parsing error: {row} -> {e}")
    return movies


def process_data() -> List['Movie']:
    # Przygotowanie danych z pliku CSV
    processor = CSVFileProcessor()
    # processor.detect_encoding('movies_metadata_macroman.csv')
    processor.convert_macroman_to_utf8('movie_data/movies_metadata_macroman.csv', 'movie_data/movies_metadata_utf8.csv')
    # processor.detect_encoding('movies_metadata_utf8.csv')
    Movie.load_language_map('movie_data/languages.json')
    movies_list = parse_csv_to_movies('movie_data/movies_metadata_utf8.csv')
    Movie.update_movie_titles_and_overview('movie_data/movies_metadata_org.csv', movies_list)

    Movie.list_genres_with_counts(movies_list)

    # for movie in movies_list[0:10]:
    #     print(movie)

    return movies_list

# Kategorie
# Movie.list_genres_with_counts(movies_list)
# Movie.list_movies_in_genre('western', movies_list)

# Języki
# Movie.count_languages(movies_list)
# Movie.find_movies_by_language(movies_list, 'pl')

# Czas trwania
# Short Films (2-40 min) - Krótkie filmy
# Medium-Length Films (41-70 min) - Filmy średniometrażowe
# Feature Films (71-150 min) - Filmy pełnometrażowe
# Extended Feature Films (151-240 min) - Filmy długometrażowe
# Epic Films (241-400 min) - Filmy epickie
# Marathon Films (401+ min) -  Maratony filmowe

# Movie.show_runtime_statistics(movies_list)
# Movie.show_movies_by_runtime_group(movies_list, 'Extended Feature Films (151-240 min)')

# Oryginalny język
# filtered_movies = [movie for movie in movies_list if movie.original_language == "pl"]
# for m in filtered_movies:
#     print(m)
# print(len(filtered_movies))

# Wyrażenie regularne do wykrywania znaków spoza alfabetu i cyfr
# pattern = re.compile(r'[^a-zA-Z0-9\s,\'"-.:!?/()]')
# for movie in movies_list:
#     if pattern.search(movie.overview):
#         print(f"Movie ID: {movie.movie_id}, Title: {movie.title}, {movie.overview}")
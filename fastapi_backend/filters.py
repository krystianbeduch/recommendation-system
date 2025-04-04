import csv
import os
from collections import defaultdict
import ast
from datetime import datetime

class MovieProcessor:
    @staticmethod
    def list_genres_with_counts(input_file: str, output_file: str) -> None:
        """Wypisuje listę wszystkich gatunków z liczbą filmów w każdym z nich i zapisuje do pliku CSV."""
        genre_count = defaultdict(int)  # Słownik, który liczy wystąpienia każdego gatunku

        with open(input_file, mode='r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter=';')
            next(reader)

            for row in reader:
                genres = ast.literal_eval(row[2])
                for genre in genres:
                    genre_count[genre.get('name')] += 1

        with open(output_file, mode='w', encoding='utf-8', newline='') as file:
            writer = csv.writer(file, delimiter=';')
            writer.writerow(['Genre', 'Count'])
            for genre, count in sorted(genre_count.items()):
                writer.writerow([genre, count])

    @staticmethod
    def filter_movies_by_genre(input_file: str, output_file: str, genre_name: str) -> None:
        """Filtruje filmy według podanego gatunku i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                genres = ast.literal_eval(row[2])
                if any(genre.get('name').lower() == genre_name.lower() for genre in genres):
                    writer.writerow(row)

    @staticmethod
    def filter_movies_by_date_range(input_file: str, output_file: str, start_year: int, end_year: int) -> None:
        """Filtruje filmy według podanego przedziału dat i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                release_date = row[15]
                try:
                    release_year = datetime.strptime(release_date, '%d.%m.%Y').year
                    if start_year <= release_year <= end_year:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_rating(input_file: str, output_file: str, min_rating: float, max_rating: float) -> None:
        """Filtruje filmy według podanej oceny i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    rating = float(row[3].strip().lstrip("'"))
                    if min_rating <= rating <= max_rating:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_popularity(input_file: str, output_file: str, min_popularity: float, max_popularity: float) -> None:
        """Filtruje filmy według podanej popularności i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    popularity = float(row[5])
                    if min_popularity <= popularity <= max_popularity:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_vote_count(input_file: str, output_file: str, min_votes: int, max_votes: int) -> None:
        """Filtruje filmy według podanej liczby głosów i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    vote_count = int(row[4])
                    if min_votes <= vote_count <= max_votes:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_budget(input_file: str, output_file: str, min_budget: int, max_budget: int) -> None:
        """Filtruje filmy według podanego budżetu i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    budget = int(row[9])
                    if min_budget <= budget <= max_budget:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_revenue(input_file: str, output_file: str, min_revenue: int, max_revenue: int) -> None:
        """Filtruje filmy według podanych przychodów i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    revenue = int(row[16])
                    if min_revenue <= revenue <= max_revenue:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_language(input_file: str, output_file: str, language_code: str) -> None:
        """Filtruje filmy według podanego języka oryginalnego i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                if row[7].strip().lower() == language_code.lower():
                    writer.writerow(row)

    @staticmethod
    def filter_movies_by_runtime(input_file: str, output_file: str, min_runtime: int, max_runtime: int) -> None:
        """Filtruje filmy według podanego czasu trwania i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                try:
                    runtime = int(row[8])
                    if min_runtime <= runtime <= max_runtime:
                        writer.writerow(row)
                except ValueError:
                    continue

    @staticmethod
    def filter_movies_by_country(input_file: str, output_file: str, country_code: str) -> None:
        """Filtruje filmy według podanego kraju produkcji i zapisuje je do nowego pliku CSV."""
        with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
            reader = csv.reader(infile, delimiter=';')
            writer = csv.writer(outfile, delimiter=';')

            header = next(reader)
            writer.writerow(header)

            for row in reader:
                production_countries = ast.literal_eval(row[14])
                if any(country.get('iso_3166_1').lower() == country_code.lower() for country in production_countries):
                    writer.writerow(row)

if __name__ == "__main__":
    #Plik UTF-8
    utf8_csv_path = 'movies_metadata_utf8.csv'
    
    # Tworzenie folderu na wyniki filtracji
    output_folder = 'filters_results'
    os.makedirs(output_folder, exist_ok=True)
    
    # Wypisuje listę wszystkich gatunków z liczbą filmów w każdym z nich i zapisuje do pliku CSV
    genres_output_csv_path = os.path.join(output_folder, 'genres_with_counts.csv')
    MovieProcessor.list_genres_with_counts(utf8_csv_path, genres_output_csv_path)
    print("Genres export success")
    
    # Filtruje filmy według podanego gatunku i zapisuje je do nowego pliku CSV
    genre_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_genre.csv')
    genre_to_filter = 'Drama'
    MovieProcessor.filter_movies_by_genre(utf8_csv_path, genre_output_csv_path, genre_to_filter)
    print("Genre filter export success")
    
    # Filtruje filmy według podanego przedziału dat i zapisuje je do nowego pliku CSV
    date_range_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_date.csv')
    start_year = 2010
    end_year = 2020
    MovieProcessor.filter_movies_by_date_range(utf8_csv_path, date_range_output_csv_path, start_year, end_year)
    print("Date range filter export success")
    
    # Filtruje filmy według podanej oceny i zapisuje je do nowego pliku CSV
    rating_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_rating.csv')
    min_rating = 7.0
    max_rating = 9.0
    MovieProcessor.filter_movies_by_rating(utf8_csv_path, rating_output_csv_path, min_rating, max_rating)
    print("Rating filter export success")
    
    # Filtruje filmy według podanej popularności i zapisuje je do nowego pliku CSV
    popularity_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_popularity.csv')
    min_popularity = 7.0
    max_popularity = 10.0
    MovieProcessor.filter_movies_by_popularity(utf8_csv_path, popularity_output_csv_path, min_popularity, max_popularity)
    print("Popularity filter export success")
    
    # Filtruje filmy według podanej liczby głosów i zapisuje je do nowego pliku CSV
    vote_count_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_vote_count.csv')
    min_votes = 100
    max_votes = 1000
    MovieProcessor.filter_movies_by_vote_count(utf8_csv_path, vote_count_output_csv_path, min_votes, max_votes)
    print("Vote count filter export success")
    
    # Filtruje filmy według podanego budżetu i zapisuje je do nowego pliku CSV
    budget_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_budget.csv')
    min_budget = 1000000
    max_budget = 100000000
    MovieProcessor.filter_movies_by_budget(utf8_csv_path, budget_output_csv_path, min_budget, max_budget)
    print("Budget filter export success")
    
    # Filtruje filmy według podanych przychodów i zapisuje je do nowego pliku CSV
    revenue_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_revenue.csv')
    min_revenue = 1000000
    max_revenue = 100000000
    MovieProcessor.filter_movies_by_revenue(utf8_csv_path, revenue_output_csv_path, min_revenue, max_revenue)
    print("Revenue filter export success")
    
    # Filtruje filmy według podanego języka oryginalnego i zapisuje je do nowego pliku CSV
    language_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_language.csv')
    language_code = 'en'
    MovieProcessor.filter_movies_by_language(utf8_csv_path, language_output_csv_path, language_code)
    print("Language filter export success")
    
    # Filtruje filmy według podanego czasu trwania i zapisuje je do nowego pliku CSV
    runtime_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_runtime.csv')
    min_runtime = 90
    max_runtime = 120
    MovieProcessor.filter_movies_by_runtime(utf8_csv_path, runtime_output_csv_path, min_runtime, max_runtime)
    print("Runtime filter export success")
    
    # Filtruje filmy według podanego kraju produkcji i zapisuje je do nowego pliku CSV
    country_output_csv_path = os.path.join(output_folder, 'filtered_movies_by_country.csv')
    country_code = 'US'
    MovieProcessor.filter_movies_by_country(utf8_csv_path, country_output_csv_path, country_code)
    print("Country filter export success")
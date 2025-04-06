// Typ odpowiadający danym użytkownika przychodzącym z API
export interface RawUser {
    username: string;
    favoriteGenres: number[];
    languagePreferences: string[];
}

// type GenreName = "Action" | "Adventure" | "Animation" | "Comedy" | "Crime" | "Documentary" |
//     "Drama" | "Family" | "Fantasy" | "History" | "Horror" | "Music" | "Mystery" | "Romance" |
//     "Science Fiction" | "TV Movie" | "Thriller" | "War" | "Western";

// Typ użytkownika gotowego do wyświetlenia (np. z przetworzonymi danymi)
export interface UserProfileProps {
    username: string;
    favoriteGenres: string[];
    languagePreferences: string[];
    onEditProfile: () => void;
    onChangeProfile: () => void;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Language {
    iso_639_1: string;
    name: string;
}

export interface ProductionCompany {
    id: number;
    name: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface MovieData {
    movie_id: number;
    title: string;
    genres: Genre[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    spoken_languages: Language[];
    original_language: string;
    runtime: number;
    budget: number;
    imdb_id: string;
    overview: string;
    poster_path: string;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    release_date: string;
    revenue: number;
}
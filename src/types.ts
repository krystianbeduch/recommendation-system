// Typ profilu uzytkownika gotowego do wyswietlenia
export interface UserProfileProps {
    userId: number;
    username: string;
    favoriteGenres: string[];
    languagePreferences: string[];
    onEditProfile?: () => void;
    onChangeProfile?: () => void;
}

// Typ dla rekomendacji filmowych w profilu uzytkownika
export interface MovieProps {
    userId: number;
}

// Typ odpowiadający danym użytkownika przychodzącym z API
export interface RawUser {
    userId: number;
    username: string;
    favoriteGenres: number[];
    languagePreferences: string[];
}

// type GenreName = "Action" | "Adventure" | "Animation" | "Comedy" | "Crime" | "Documentary" |
//     "Drama" | "Family" | "Fantasy" | "History" | "Horror" | "Music" | "Mystery" | "Romance" |
//     "Science Fiction" | "TV Movie" | "Thriller" | "War" | "Western";

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
    genres: Genre[]; // Gatunki zawierają zarówno id, jak i name
    vote_average: number;
    spoken_languages: Language[]; // Języki zawierają zarówno iso_639_1, jak i name
    poster_path: string;
    release_date: string;
}

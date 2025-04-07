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
  genres: Genre[]; // Gatunki zawierają zarówno id, jak i name
  vote_average: number;
  spoken_languages: Language[]; // Języki zawierają zarówno iso_639_1, jak i name
  poster_path: string;
  release_date: string;
}

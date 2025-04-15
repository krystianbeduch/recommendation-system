// Typ meta danych ladowaych przy starcie aplikajci
export type GenreMap = Record<number, Genre>;
export interface MetadataContextProps {
    genresMap: GenreMap;
    languagesMap: Language[];
    users: UserProfileProps[];
    dataLoaded: boolean;
    selectedUserId: number | null;
    setSelectedUserId: (id: number | null) => void;
    getUsers: () => Promise<void>;
}

// Typ odpowiadający danym użytkownika przychodzącym z API
export interface RawUser {
    userId: number;
    username: string;
    favoriteGenres: number[];
    languagePreferences: string[];
}

// Typ profilu uzytkownika gotowego do wyswietlenia
export interface UserProfileProps {
    userId: number;
    username: string;
    favoriteGenres: Genre[];
    languagePreferences: Language[];
    onEditProfile?: () => void;
    onChangeProfile?: () => void;
}

export interface UserProfileCardProps {
    user: UserProfileProps,
    onSelect: () => void;
    isSelected: boolean;
}

// Typ dla rekomendacji filmowych w profilu uzytkownika
export interface MovieProps {
    userId: number;
}

export interface EditProfileFormData {
    username: string;
    selectedGenres: Genre[];
    selectedLanguages: Language[];
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
    count: number;
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
    spoken_languages: Language[];
    poster_path: string;
    release_date: string;
}

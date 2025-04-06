import React, { useState, useEffect } from 'react';
import {Box, Grid, Paper, Typography} from '@mui/material';
import { Movie as MovieIcon } from '@mui/icons-material';
import axios, { AxiosError, AxiosResponse } from 'axios';

// Typ danych filmów
interface Genre {
    id: number;
    name: string;
}

interface Language {
    iso_639_1: string;
    name: string;
}

interface ProductionCompany {
    id: number;
    name: string;
}

interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

interface MovieData {
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


const Movie: React.FC = () => {
    const [movies, setMovies] = useState<MovieData[]>([]);

    useEffect(() => {
        axios
            .get<MovieData[]>('http://localhost:8000/api/movies/language/af')
            .then((response: AxiosResponse<MovieData[]>) => {
                setMovies(response.data);
            })
            .catch((error: AxiosError) => {
              console.error('Error fetching movies: ', error.message)
            })
    }, []);

    return (
        // <div>
        <Box sx={{ padding: 1 }}>
            <Typography variant="h5" gutterBottom>
                <MovieIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Movies
            </Typography>
            <Grid container spacing={2}>
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <Grid key={movie.movie_id} component="div">
                            <Paper sx={{ padding: 1 }}>
                                {/* Wyświetlanie filmu */}
                                <Typography variant="h6">{movie.title}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Genres: {movie.genres.map(genre => genre.name).join(', ')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Languages: {movie.spoken_languages.map(lang => lang.name).join(', ')}
                                </Typography>
                                {movie.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                        alt={movie.title}
                                        style={{ width: '50%', borderRadius: '4px' }}
                                    />
                                )}
                            </Paper>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">No movies available</Typography>
                )}
            </Grid>
        {/*</div>*/}
        </Box>
    );
};

export default Movie;

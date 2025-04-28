import { Movie as MovieIcon, Star as StarIcon } from '@mui/icons-material';
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Grid, Paper, Slider, TextField, Typography
} from '@mui/material';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { MovieData, MovieProps, UserRate } from '../types';

const Movie: React.FC<MovieProps> = ({ userId }) => {
    const [movies, setMovies] = useState<MovieData[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [alreadyRated, setAlreadyRated] = useState<boolean>(false);
    const [alreadyRatedRating, setAlreadyRatedRating] = useState<number>(-1);

    useEffect(() => {
        if (!userId) return;

        axios
            .get<MovieData[]>(`http://localhost:8000/api/movies/recommended/${userId}`)
            .then((response: AxiosResponse<MovieData[]>) => {
                setMovies(response.data);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching recommended movies: ", error.message);
            });
    }, [userId]);

    const handleMovieClick = async (movie: MovieData) => {
        setSelectedMovie(movie);
        setOpenModal(true);
        try {
            const response: AxiosResponse<{ rated: boolean, score: UserRate | null }> = await axios.get(
                `http://localhost:8000/api/movies/check-rate/${userId}/${movie.movie_id}`
            );
            if (response.data.rated && response.data.score?.rating) {
                console.log("User already rated:", response.data.score);
                setAlreadyRated(true);
                setAlreadyRatedRating(response.data.score.rating);
            }
            else {
                console.log("User has not rated this movie yet");
                setAlreadyRated(false);
                setAlreadyRatedRating(-1);
            }
        }
        catch (error) {
            console.error("Error fetching rating", error);
        }
    };

    const handleCloseModel = () => {
        setOpenModal(false);
        setRating(0);
    };

    const handleSubmitRating = async () => {
        // console.log(`ocena Przed: ${rating}`)
        // console.log(selectedMovie);
        // console.log();
        if (selectedMovie && rating >= 0) {
            // console.log(`ocena: ${rating}`)
            // console.log(`avg: ${selectedMovie.rating}`)
            // console.log(`avg_c: ${selectedMovie.vote_count}`)
            const body = {
                user_id: userId,
                movie_id: selectedMovie.movie_id,
                rating: rating
            };
            try {
                await axios.post("http://localhost:8000/api/movies/add-rate", body);
                console.log("Rating added");
                console.log(body)
            }
            catch (error) {
                console.error("Error adding rate", error);
            }
        }
        handleCloseModel();
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Typography variant="h5" gutterBottom>
                <MovieIcon sx={{ verticalAlign: "middle", mr: 1 }}/>
                Movies
            </Typography>
            <Grid container spacing={2}>
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <Grid key={movie.movie_id} component="div">
                            <Paper
                                sx={{
                                    padding: 1,
                                    height: "100%",
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: "secondary.dark",
                                    },
                                }}
                                onClick={() => handleMovieClick(movie)}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6">{movie.title}</Typography>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <StarIcon sx={{ fontSize: 18, color: "#ffd700", mr: 0.5}} />
                                        <Typography variant="body2" color="white">
                                            {movie.rating?.toFixed(1) ?? "NA"}/10 ({movie.vote_count ?? 0})
                                        </Typography>
                                    </Box>

                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Genres: {movie.genres.map((genre) => genre.name).join(", ")}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Languages:{" "}
                                    {movie.spoken_languages.map((lang) => lang.name).join(", ")}
                                </Typography>

                                {movie.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                                        alt={movie.title}
                                        style={{ width: "50%", borderRadius: "4px" }}
                                    />
                                )}
                            </Paper>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">Movie recommendation in progress...</Typography>
                )}
            </Grid>

            <Dialog
                open={openModal}
                onClose={handleCloseModel}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 400,
                        }
                    }
                }}
            >
                <DialogTitle>Rate Movie</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">{selectedMovie?.title}</Typography>

                    {(alreadyRated && alreadyRatedRating > -1) ? (
                        <>
                            <Typography variant="body2" color="warning" sx={{ mt: 2 }}>
                                You have already rated this movie!
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                    Your rating: <strong>{alreadyRatedRating}/10</strong>
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                Rate this movie:
                            </Typography>
                            <Slider
                                value={rating}
                                onChange={(_, newValue) => setRating(newValue as number)}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}/10`}
                                min={0}
                                max={10}
                                step={0.5}
                            />
                            <TextField
                                label="Your rating"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                type="number"
                                slotProps={{
                                    input: {
                                        inputProps: {
                                            min: 0,
                                            max: 10,
                                            step: 0.5
                                        }
                                    }
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModel} color="primary">
                        Cancel
                    </Button>
                    {!alreadyRated && (
                        <Button onClick={handleSubmitRating} color="primary">
                            Submit
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Movie;

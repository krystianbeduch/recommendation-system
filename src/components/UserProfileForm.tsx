import {
    Alert, Box, Button, Chip, Container, FormControl, InputLabel,
    ListSubheader, MenuItem, OutlinedInput, Select,
    SelectChangeEvent, TextField, Typography
} from '@mui/material';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Genre, Language, ProfileFormData, UserProfileFormProps } from '../types';

const UserProfileForm: React.FC<UserProfileFormProps> = ({ title, buttonSaveLabel, initialData, onSubmit, onCancel, genresMap, languagesMap}) => {
    const [formData, setFormData] = useState<ProfileFormData>(initialData);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenresChange = (event: SelectChangeEvent<number[]>) => {
        const { value } = event.target;
        if (Array.isArray(value)) {
            // Mapowanie `id` na pełne obiekty `Genre`
            const selectedGenres = value.map((id: number) => genresMap[id]);
            setFormData((prev) => ({ ...prev, selectedGenres }));
        }
    };

    const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
        const { value } = event.target;
        if (Array.isArray(value)) {
            const selectedLanguages = value
                .map((iso: string) => languagesMap.find((lang) => lang.iso_639_1 === iso))
                .filter((lang): lang is Language => lang !== undefined);
            setFormData((prev) => ({ ...prev, selectedLanguages }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username.trim()) {
            setErrorMessage("Please enter a name");
            return;
        }

        console.log("Saving profile:", {
            formData
        });

        setErrorMessage(null);

        try {
            await onSubmit(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(null), 5000);
        }
        catch (err) {
            console.error("Error updating user profile: ", err)
            const axiosError: AxiosError = err as AxiosError;

            let message: string = "Failed to update user. Please try again.";
            if (axiosError.response && axiosError.response.status === 400) {
                message = "Invalid data submitted.";
            }
            else if (axiosError.response && axiosError.response.status >= 500) {
                message = "Server error occurred. Please try again later.";
            }

            setSuccess(false);
            setErrorMessage(message);
        }
    };

    // Sortowanie jezykow
    const popularLanguages = languagesMap
        .filter(lang => lang.count >= 250)
        .sort((a, b) => b.count - a.count);

    const otherLanguages = languagesMap
        .filter(lang => lang.count < 250)
        .sort((a, b) => a.name.localeCompare(b.name));

    // Sortowanie gatunkow alfabetycznie
    const sortedGenres = Object.entries(genresMap)
        .map(([id, genre]) => [Number(id), genre] as [number, Genre])
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    name="username"
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Favorite Genres</InputLabel>
                    <Select
                        multiple
                        value={formData.selectedGenres.map((genre) => genre.id)}
                        onChange={handleGenresChange}
                        input={<OutlinedInput label="Favorite Genres" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(selected as unknown as number[]).map((id) => (
                                    <Chip key={id} label={genresMap[id]?.name} />
                                ))}
                            </Box>
                        )}
                        variant="outlined"
                    >
                        {sortedGenres.map(([id, genre]) => (
                            <MenuItem key={id} value={id}>
                                {genre.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Language Preferences</InputLabel>
                    <Select
                        multiple
                        value={formData.selectedLanguages.map((lang) => lang.iso_639_1)}
                        onChange={handleLanguagesChange}
                        input={<OutlinedInput label="Language Preferences" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {(selected as string[]).map((iso) => (
                                    <Chip key={iso} label={languagesMap.find((lang) => lang.iso_639_1 === iso)?.name} />
                                ))}
                            </Box>
                        )}
                        variant="outlined"
                    >
                        <ListSubheader>Popular languages</ListSubheader>
                        {popularLanguages.map(({ iso_639_1, name, count }) => (
                            <MenuItem key={iso_639_1} value={iso_639_1}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <span>{name}</span>
                                    <span style={{ fontSize: "0.8rem", color: "gray" }}>{count} movies</span>
                                </Box>
                            </MenuItem>
                        ))}
                        <ListSubheader>Other languages</ListSubheader>
                        {otherLanguages.map(({ iso_639_1, name, count }) => (
                            <MenuItem key={iso_639_1} value={iso_639_1}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <span>{name}</span>
                                    <span style={{ fontSize: "0.8rem", color: "gray" }}>{count} movies</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                    {buttonSaveLabel}
                </Button>
                <Button type="button" variant="contained" color="error" fullWidth sx={{ mt: 3 }} onClick={onCancel}>
                    Exit
                </Button>
            </form>

            {errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Success!
                </Alert>
            )}
        </Container>
    );
};

export default UserProfileForm;

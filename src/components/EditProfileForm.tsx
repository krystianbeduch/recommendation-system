import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Button,
    Box,
    Chip, SelectChangeEvent, ListSubheader
} from "@mui/material";
import { useMetadata } from "../contexts/MetadataContext";
import { Genre, Language } from "../types.ts";


interface EditProfileFormData {
    username: string;
    selectedGenres: Genre[];
    selectedLanguages: Language[];
}

const EditProfileForm: React.FC = () => {
    const { userId } = useParams<{ userId: string}>();
    const userIdInt = userId ? parseInt(userId) : null;

    const { genresMap, languagesMap, users, dataLoaded } = useMetadata();

    const user = users.find((user) => user.userId === userIdInt);
    // if (!user) {
    //     return null;
    // }

    const [formData, setFormData] = useState<EditProfileFormData>({
        username: '',
        selectedGenres: [] as Genre[],
        selectedLanguages: [] as Language[],
    });

    useEffect(() => {
        if (user) {
            // Jeśli user jest dostępny, zaktualizuj stan formularza
            setFormData({
                username: user.username,
                selectedGenres: user.favoriteGenres,
                selectedLanguages: user.languagePreferences
            });
        }
    }, [user]);  // Używamy user jako zależności, aby zaktualizować stan po jego załadowaniu

    if (!user) {
        return null;  // Jeśli user jest null, nie renderuj formularza
    }

    // const [newGenre, setNewGenre] = useState("");
    // const [newLanguage, setNewLanguage] = useState("");

    // const [username, setUsername] = useState("");
    // const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    // const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenresChange = (event: SelectChangeEvent<number[]>) => {
        const { value } = event.target;
        // setFormData((prev) => ({
        //     ...prev,
        //     selectedGenres: value as Genre[], // Aktualizacja stanu
        // }));
        if (Array.isArray(value)) {
            // Mapowanie `id` na pełne obiekty `Genre`
            const selectedGenres = value.map((id: number) => genresMap[id]);

            setFormData((prev) => ({
                ...prev,
                selectedGenres: selectedGenres,  // Zaktualizowane obiekty `Genre`
            }));

            console.log(formData);
        }
        // const selectedGenres = value.map((id: number) => genresMap[id]);  // Mapujemy `id` na pełne obiekty `Genre`
        // setFormData((prev) => ({
        //     ...prev,
        //     selectedGenres: selectedGenres,  // Zaktualizowane obiekty `Genre`
        // }));

        // console.log(formData);
    };
        // const genres = event.target.value as Genre[]; // Casting the value to number[]
        // setFormData({ ...fo

    // const handleLanguagesChange = (event: SelectChangeEvent<unknown>) => {
    //     const languages = event.target.value as string[]; // Casting the value to string[]
    //     setFormData({ ...formData, selectedLanguages: languages });
    // };

    const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
        const { value } = event.target;
        // setFormData((prev) => ({
        //     ...prev,
        //     selectedGenres: value as Genre[], // Aktualizacja stanu
        // }));
        if (Array.isArray(value)) {
            // Mapowanie `id` na pełne obiekty `Genre`
            const selectedLanguages = value
                .map((iso_639_1: string) => languagesMap.find((lang) => lang.iso_639_1 === iso_639_1)) // Znajdź obiekt Language po iso_639_1
                .filter((lang): lang is Language => lang !== undefined); // Filtrujemy ewentualne undefined (jeśli nie znaleziono języka)


            setFormData((prev) => ({
                ...prev,
                selectedLanguages: selectedLanguages,  // Zaktualizowane obiekty `Genre`
            }));

            console.log(formData);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving profile:", {
            userId,
            ...formData
        });
        // Można teraz wysłać dane na backend
    };

    if (!userIdInt || isNaN(userIdInt)) {
        return <Typography>Invalid user ID</Typography>;
    }

    if (!dataLoaded) {
        return <Typography>Loading metadata</Typography>;
    }

    // Sortowanie gatunków alfabetycznie
    // const sortedGenres = Object.entries(genresMap)
    //     .sort(([, nameA], [, nameB]) =>
    //         genre.nameA.localeCompare(genre.nameB)
    // );
    const sortedGenres = Object.entries(genresMap)
        .map(([id, genre]) => [Number(id), genre] as [number, Genre])
        .sort(([, a], [, b]) => a.name.localeCompare(b.name));


    // const allLanguages = Object.entries(languagesMap).map(([code, name, count]) => ({
    //     code,
    //     name,
    //     count: languageCount[code] || 0,
    // }));


    // Sortowanie jezykow
    const popularLanguages = languagesMap
        .filter(lang => lang.count >= 250)
        .sort((a, b) => b.count - a.count);

    const otherLanguages = languagesMap
        .filter(lang => lang.count < 250)
        .sort((a, b) => a.name.localeCompare(b.name));


    // const popularLanguages = Object.entries(languageCount)
    //     .filter([langCode, count]) => count >= 250)
    //     .sort((a, b) => b[1] - a[1]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Edit Profile (ID: {userId})
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    name="username"
                    // value={user?.username}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Favorite Genres</InputLabel>
                    <Select
                        multiple
                        // value={formData.selectedGenres}
                        value={formData.selectedGenres.map((genre) => genre.id)}  // Trzymamy tylko `id` w `value`

                        onChange={handleGenresChange}
                        input={<OutlinedInput label="Favorite Genres" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {/*{(selected as Genre[]).map((genre) => (*/}
                                {/*    <Chip key={genre.id} label={genre.name} />*/}
                                {/*))}*/}
                                {(selected as unknown as number[]).map((id) => (
                                    <Chip key={id} label={genresMap[id]?.name} />  // Mapujemy `id` z powrotem na nazwę gatunku
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
                        // value={formData.selectedLanguages}
                        value={formData.selectedLanguages.map((lang) => lang.iso_639_1)}  // Trzymamy tylko `id` w `value`
                        onChange={handleLanguagesChange}
                        input={<OutlinedInput label="Language Preferences" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>{name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'gray' }}>{count} movies</span>
                                </Box>
                            </MenuItem>
                        ))}

                        <ListSubheader>Other languages</ListSubheader>
                        {otherLanguages.map(({ iso_639_1, name, count }) => (
                            <MenuItem key={iso_639_1} value={iso_639_1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>{name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'gray' }}>{count} movies</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                    Save Changes
                </Button>
            </form>
        </Container>
    );
};

export default EditProfileForm;

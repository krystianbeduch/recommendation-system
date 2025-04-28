// import {
//     Alert,
//     Box, Button, Chip, Container, FormControl, InputLabel, ListSubheader, MenuItem,
//     OutlinedInput, Select, SelectChangeEvent, TextField, Typography
// } from "@mui/material";
// import axios, { AxiosError, AxiosResponse } from "axios";
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useMetadata } from "../contexts/MetadataContext";
// import { EditProfileFormData, Genre, Language, RawUser } from "../types.ts";
//
// const EditProfileForm: React.FC = () => {
//     const { userId } = useParams<{ userId: string }>();
//     const userIdInt = userId ? parseInt(userId) : null;
//     const { genresMap, languagesMap, users, dataLoaded, getUsers, selectedUserId } = useMetadata();
//     const user = users.find((user) => user.userId === userIdInt);
//
//     const [formData, setFormData] = useState<EditProfileFormData>({
//         username: '',
//         selectedGenres: [] as Genre[],
//         selectedLanguages: [] as Language[],
//     });
//
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const [success, setSuccess] = useState<boolean | null>(null);
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         if (user) {
//             // Jeśli user jest dostępny, zaktualizuj stan formularza
//             setFormData({
//                 username: user.username,
//                 selectedGenres: user.favoriteGenres,
//                 selectedLanguages: user.languagePreferences
//             });
//         }
//     }, [user]);  // Używamy user jako zależności, aby zaktualizować stan po jego załadowaniu
//
//     if (!user) {
//         return null;  // Jeśli user jest null, nie renderuj formularza
//     }
//
//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };
//
//     const handleGenresChange = (event: SelectChangeEvent<number[]>) => {
//         const { value } = event.target;
//         if (Array.isArray(value)) {
//             // Mapowanie `id` na pełne obiekty `Genre`
//             const selectedGenres = value.map((id: number) => genresMap[id]);
//
//             setFormData((prev) => ({
//                 ...prev,
//                 selectedGenres: selectedGenres,  // Zaktualizowane obiekty `Genre`
//             }));
//         }
//     };
//
//     const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
//         const { value } = event.target;
//         if (Array.isArray(value)) {
//             const selectedLanguages = value
//                 .map((iso_639_1: string) => languagesMap.find((lang) => lang.iso_639_1 === iso_639_1)) // Znajdź obiekt Language po iso_639_1
//                 .filter((lang): lang is Language => lang !== undefined); // Filtrujemy ewentualne undefined (jeśli nie znaleziono języka)
//
//             setFormData((prev) => ({
//                 ...prev,
//                 selectedLanguages: selectedLanguages,  // Zaktualizowane obiekty `Genre`
//             }));
//         }
//     }
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         // console.log(formData.username);
//         // console.log(formData.selectedGenres.map(genre => genre.id));
//         // console.log(formData.selectedLanguages.map(lang => lang.iso_639_1));
//
//         console.log("Saving profile:", {
//             userIdInt,
//             ...formData
//         });
//
//         if (!formData.username.trim()) {
//             setErrorMessage("Please enter a name");
//             return;
//         }
//
//         setErrorMessage(null);
//
//         const requestBody = {
//             userId: userIdInt,
//             username: formData.username,
//             favoriteGenres: formData.selectedGenres.map(genre => genre.id),
//             languagePreferences: formData.selectedLanguages.map(lang => lang.iso_639_1),
//         };
//
//         console.log(requestBody);
//
//         try {
//             const response: AxiosResponse<RawUser> = await axios.put(`http://localhost:8000/api/users/edit/${userId}`, requestBody);
//             console.log(response.data);
//             setSuccess(true);
//
//             setTimeout(() => {
//                 setSuccess(null);
//             }, 5000);
//
//             await getUsers();
//         }
//         catch (err) {
//             console.error("Error updating user profile: ", err)
//             const axiosError: AxiosError = err as AxiosError;
//
//             let message: string = "Failed to update user. Please try again.";
//             if (axiosError.response && axiosError.response.status === 400) {
//                 message = "Invalid data submitted.";
//             } else if (axiosError.response && axiosError.response.status >= 500) {
//                 message = "Server error occurred. Please try again later.";
//             }
//
//             setSuccess(false);
//             setErrorMessage(message);
//         }
//         // Można teraz wysłać dane na backend
//     };
//
//     const onCancel = () => {
//         console.log(selectedUserId)
//         navigate("/dashboard");
//     }
//
//     if (!userIdInt || isNaN(userIdInt)) {
//         return <Typography>Invalid user ID</Typography>;
//     }
//
//     if (!dataLoaded) {
//         return <Typography>Loading metadata</Typography>;
//     }
//
//     // Sortowanie gatunkow alfabetycznie
//     const sortedGenres = Object.entries(genresMap)
//         .map(([id, genre]) => [Number(id), genre] as [number, Genre])
//         .sort(([, a], [, b]) => a.name.localeCompare(b.name));
//
//     // Sortowanie jezykow
//     const popularLanguages = languagesMap
//         .filter(lang => lang.count >= 250)
//         .sort((a, b) => b.count - a.count);
//
//     const otherLanguages = languagesMap
//         .filter(lang => lang.count < 250)
//         .sort((a, b) => a.name.localeCompare(b.name));
//
//     return (
//         <Container maxWidth="sm" sx={{ mt: 4 }}>
//             <Typography variant="h4" gutterBottom>
//                 Edit Profile (ID: {userId})
//             </Typography>
//
//             <form onSubmit={handleSubmit}>
//                 <TextField
//                     fullWidth
//                     margin="normal"
//                     label="Username"
//                     value={formData.username}
//                     onChange={handleInputChange}
//                     name="username"
//                 />
//
//                 <FormControl fullWidth margin="normal">
//                     <InputLabel>Favorite Genres</InputLabel>
//                     <Select
//                         multiple
//                         value={formData.selectedGenres.map((genre) => genre.id)}
//                         onChange={handleGenresChange}
//                         input={<OutlinedInput label="Favorite Genres"/>}
//                         renderValue={(selected) => (
//                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                 {(selected as unknown as number[]).map((id) => (
//                                     <Chip key={id} label={genresMap[id]?.name}/>
//                                 ))}
//                             </Box>
//                         )}
//                         variant="outlined"
//                     >
//                         {sortedGenres.map(([id, genre]) => (
//                             <MenuItem key={id} value={id}>
//                                 {genre.name}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>
//
//                 <FormControl fullWidth margin="normal">
//                     <InputLabel>Language Preferences</InputLabel>
//                     <Select
//                         multiple
//                         value={formData.selectedLanguages.map((lang) => lang.iso_639_1)}  // Trzymamy tylko `id` w `value`
//                         onChange={handleLanguagesChange}
//                         input={<OutlinedInput label="Language Preferences"/>}
//                         renderValue={(selected) => (
//                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                 {(selected as string[]).map((iso) => (
//                                     <Chip key={iso} label={languagesMap.find((lang) => lang.iso_639_1 === iso)?.name}/>
//                                 ))}
//                             </Box>
//                         )}
//                         variant="outlined"
//                     >
//                         <ListSubheader>Popular languages</ListSubheader>
//                         {popularLanguages.map(({ iso_639_1, name, count }) => (
//                             <MenuItem key={iso_639_1} value={iso_639_1}>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
//                                     <span>{name}</span>
//                                     <span style={{ fontSize: '0.8rem', color: 'gray' }}>{count} movies</span>
//                                 </Box>
//                             </MenuItem>
//                         ))}
//
//                         <ListSubheader>Other languages</ListSubheader>
//                         {otherLanguages.map(({ iso_639_1, name, count }) => (
//                             <MenuItem key={iso_639_1} value={iso_639_1}>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
//                                     <span>{name}</span>
//                                     <span style={{ fontSize: '0.8rem', color: 'gray' }}>{count} movies</span>
//                                 </Box>
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>
//
//                 <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
//                     Save Changes
//                 </Button>
//                 <Button type="button" variant="contained" color="error" fullWidth sx={{ mt: 3 }} onClick={onCancel}>
//                     Exit
//                 </Button>
//             </form>
//             {errorMessage && (
//                 <Alert severity="error" sx={{ mb: 2 }}>
//                     {errorMessage}
//                 </Alert>
//             )}
//
//             {success && (
//                 <Alert severity="success" sx={{ mb: 2 }}>
//                     Profile updated successfully!
//                 </Alert>
//             )}
//         </Container>
//     );
// };
//
// export default EditProfileForm;

import React from "react";
import UserProfileForm from "./UserProfileForm";
import { useMetadata } from "../contexts/MetadataContext";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { ProfileFormData, RawUser } from "../types";

const EditProfileForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { genresMap, languagesMap, users, getUsers, dataLoaded } = useMetadata();
    const user = users.find(u => u.userId === parseInt(userId ?? ""));

    if (!user) return <p>User not found</p>;
    if (!dataLoaded) return <p>Loading...</p>;

    const initialData: ProfileFormData = {
        username: user.username,
        selectedGenres: user.favoriteGenres,
        selectedLanguages: user.languagePreferences
    };

    const handleSubmit = async (formData: ProfileFormData) => {
        const body = {
            userId: user.userId,
            username: formData.username,
            favoriteGenres: formData.selectedGenres.map(g => g.id),
            languagePreferences: formData.selectedLanguages.map(l => l.iso_639_1)
        };
        const response: AxiosResponse<RawUser> = await axios.put<RawUser>(`http://localhost:8000/api/users/edit/${user.userId}`, body);
        console.log(response.data);

        await getUsers();
    };

    return (
        <UserProfileForm
            title={`Edit Profile (ID: ${userId})`}
            buttonSaveLabel="Save changes"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard")}
            genresMap={genresMap}
            languagesMap={languagesMap}
        />
    );
};

export default EditProfileForm;

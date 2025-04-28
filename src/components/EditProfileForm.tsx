import React from 'react';
import UserProfileForm from './UserProfileForm';
import { useMetadata } from '../contexts/MetadataContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { ProfileFormData, RawUser } from '../types';

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

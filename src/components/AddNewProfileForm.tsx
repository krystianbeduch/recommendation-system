import React from "react";
import UserProfileForm from "./UserProfileForm";
import { useMetadata } from "../contexts/MetadataContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ProfileFormData } from "../types";

const AddNewProfileForm: React.FC = () => {
    const navigate = useNavigate();
    const { genresMap, languagesMap, getUsers } = useMetadata();

    const initialData: ProfileFormData = {
        username: "",
        selectedGenres: [],
        selectedLanguages: []
    };

    const handleSubmit = async (formData: ProfileFormData) => {
        const body = {
            username: formData.username,
            favoriteGenres: formData.selectedGenres.map(g => g.id),
            languagePreferences: formData.selectedLanguages.map(l => l.iso_639_1)
        };
        await axios.post(`http://localhost:8000/api/users/add`, body);
        await getUsers();
    };

    return (
        <UserProfileForm
            title="Create New Profile"
            buttonSaveLabel="Add New Profile"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard")}
            genresMap={genresMap}
            languagesMap={languagesMap}
        />
    );
};

export default AddNewProfileForm;

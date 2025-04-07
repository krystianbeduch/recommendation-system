import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Movie from '../components/Movie';
import UserProfile from '../components/UserProfile';
import { useMetadata } from '../contexts/MetadataContext';
import { RawUser, UserProfileProps } from '../types.ts';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { genresMap, languagesMap, dataLoaded, selectedUserId } = useMetadata();
    if (!selectedUserId) {
        navigate("/");
    }

    const [user, setUser] = useState<UserProfileProps | null>(null);
    const [userData, setUserData] = useState<RawUser | null>(null);

    
    const loadUserById = async (selectedUserId: number): Promise<void> => {
        try {
            const response: AxiosResponse<RawUser> = await axios.get<RawUser>(
                `http://localhost:8000/api/users/${selectedUserId}`
            );
            setUserData(response.data);
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching user:", error.message);
            }
            else {
                console.error("Unexpected error:", error);
            }
        }
    };
    

    // Klikniecie przycisku "Change profile"
    useEffect(() => {
        if (dataLoaded && selectedUserId) {
            loadUserById(selectedUserId);
        }
    }, [dataLoaded, selectedUserId]);

    // Mapowanie gatunkow i jezykow dla profilu uzytkownika
    useEffect(() => {
        if (
            userData &&
            Object.keys(genresMap).length > 0 &&
            Object.keys(languagesMap).length > 0
        ) {
            // Mapowanie gatunkow i jezykow
            const mappedGenres = userData.favoriteGenres.map(
                (id: number) => genresMap[id] || `Unknown (${id})`
            );

            const mappedLanguages = userData.languagePreferences.map(
                (code: string) => languagesMap[code] || `Unknown (${code})`
            );

            const transformedUser: UserProfileProps = {
                userId: userData.userId,
                username: userData.username,
                favoriteGenres: mappedGenres,
                languagePreferences: mappedLanguages,
                onEditProfile: () => console.log("Edit profile"),
                onChangeProfile: () => navigate("/")
            };

            setUser(transformedUser);
        }
    }, [userData, genresMap, languagesMap, navigate]);

    return user ? (
        <>
            <UserProfile {...user} />
            <Movie userId={user.userId}/>
        </>
    ) : (
        <div>Loading...</div>
    )
};

export default Dashboard;
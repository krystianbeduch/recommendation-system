import React, { useEffect, useState } from "react";
import { Genre, Language, RawUser, UserProfileProps } from "../types.ts";
import axios, { AxiosResponse } from "axios";
import Movie from "../components/Movie";
import UserProfile from "../components/UserProfile";
import {useMetadata} from "../contexts/MetadataContext.tsx";
import {useNavigate} from "react-router-dom";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { genresMap, languagesMap, dataLoaded, selectedUserId } = useMetadata();
    if (!selectedUserId) {
        navigate("/");
    }

    const [user, setUser] = useState<UserProfileProps | null>(null);
    // const [genresMap, setGenresMap] = useState<Record<number, string>>({});
    // const [languagesMap, setLanguagesMap] = useState<Record<string, string>>({});
    const [userData, setUserData] = useState<RawUser | null>(null);
    // const [dataLoaded, setDataLoaded] = useState<boolean>(false);

    console.log(genresMap);
    console.log(languagesMap);
    console.log(dataLoaded);
    console.log(selectedUserId);
    // const {selectedUserId} = useMetadata();

    // const userId = Number(localStorage.getItem("selectedUserId"));

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

    // const fetchMetadata = async (): Promise<void> => {
    //     try {
    //         const [genresRes, languageRes]: [
    //             AxiosResponse<Genre[]>,
    //             AxiosResponse<Language[]>,
    //         ] = await Promise.all([
    //             axios.get<Genre[]>("http://localhost:8000/api/genres"),
    //             axios.get<Language[]>("http://localhost:8000/api/languages"),
    //         ]);
    //
    //         setGenresMap(Object.fromEntries(
    //             genresRes.data.map(({ id, name }) => [id, name])
    //         ));
    //         setLanguagesMap(Object.fromEntries(
    //             languageRes.data.map(({ iso_639_1, name }) => [iso_639_1, name])
    //         ));
    //         setDataLoaded(true);
    //     }
    //     catch (error: unknown) {
    //         if (axios.isAxiosError(error)) {
    //             console.error("Error fetching metadata:", error.message);
    //         }
    //         else {
    //             console.error("Unexpected error:", error);
    //         }
    //     }
    // };

    // Pobranie danych do mapowania
    // useEffect(() => {
    //     fetchMetadata();
    // }, []);

    // Klikniecie przycisku "Change profile" - tymczasowo
    useEffect(() => {
        if (dataLoaded && selectedUserId) {
            loadUserById(selectedUserId);
        }
    }, [dataLoaded]);

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
    }, [userData, genresMap, languagesMap]);

    return user ? (
        <>
            <UserProfile {...user} />
            <Movie userId={user.userId} />
        </>
    ) : (
        <div>Loading...</div>
    )
};

export default Dashboard;
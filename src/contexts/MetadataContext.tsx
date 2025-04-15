import axios, { AxiosResponse } from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Genre, GenreMap, Language, MetadataContextProps, RawUser, UserProfileProps } from "../types.ts";

const MetadataContext = createContext<MetadataContextProps>({
    genresMap: {},
    languagesMap: [],
    users: [],
    dataLoaded: false,
    selectedUserId: null,
    setSelectedUserId: () => {},
    getUsers: async () => {}
});

// eslint-disable-next-line react-refresh/only-export-components
export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [genresMap, setGenresMap] = useState<GenreMap>({});
    const [languagesMap, setLanguagesMap] = useState<Language[]>([]);
    const [users, setUsers] = useState<UserProfileProps[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const getUsers = async () => {
        try {
            const usersResponse: AxiosResponse<RawUser[]> = await axios.get("http://localhost:8000/api/users");
            const mappedUsers = usersResponse.data.map((user) => ({
                ...user,
                favoriteGenres: user.favoriteGenres
                    .map((id: number) => genresMap[id])
                    .filter((genre): genre is Genre => genre !== undefined),
                languagePreferences: user.languagePreferences
                    .map((iso_639_1: string) => languagesMap.find((lang) => lang.iso_639_1 === iso_639_1))
                    .filter((lang): lang is Language => lang !== undefined),
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error("Error refreshing users", error);
        }
    }

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [genresRes, languagesRes]: [
                    AxiosResponse<{ id: number, name: string }[]>,
                    AxiosResponse<{ iso_639_1: string, name: string, count: number }[]>,
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/genres"),
                    axios.get("http://localhost:8000/api/languages"),
                ]);

                const genresMapTemp: Record<number, Genre> = Object.fromEntries(
                    genresRes.data.map(g => [g.id, { id: g.id, name: g.name }])
                );

                const languagesMapTemp: Language[] = languagesRes.data.map((l) => ({
                    iso_639_1: l.iso_639_1,
                    name: l.name,
                    count: l.count,
                }));

                const usersResponse: AxiosResponse<RawUser[]> = await axios.get("http://localhost:8000/api/users");
                const mappedUsers = usersResponse.data.map((user) => ({
                    ...user,
                    favoriteGenres: user.favoriteGenres
                        .map((id: number) => genresMapTemp[id])
                        .filter((genre): genre is Genre => genre !== undefined),
                    languagePreferences: user.languagePreferences
                        .map((iso_639_1: string) => languagesMapTemp.find((lang) => lang.iso_639_1 === iso_639_1))
                        .filter((lang): lang is Language => lang !== undefined),
                }));
                setGenresMap(genresMapTemp);
                setLanguagesMap(languagesMapTemp);
                setUsers(mappedUsers);
                setDataLoaded(true);
            }
            catch (error) {
                console.error("Error loading metadata", error);
            }
        };
        fetchMetadata();
    }, []);

    return (
        <MetadataContext.Provider value={{ genresMap, languagesMap, users, dataLoaded, selectedUserId, setSelectedUserId, getUsers }}>
            {children}
        </MetadataContext.Provider>
    );
};
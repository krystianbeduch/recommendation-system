import axios, { AxiosResponse } from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Genre, Language, RawUser, UserProfileProps } from "../types.ts";

type GenreMap = Record<number, Genre>;
// type LanguageMap = eRcord<string, Language>;
type LanguageCount = Record<string, number>;

interface MetadataContextProps {
    genresMap: GenreMap;
    languagesMap: Language[];
    languageCount: LanguageCount;
    users: UserProfileProps[];
    dataLoaded: boolean;
    selectedUserId: number | null;
    setSelectedUserId: (id: number | null) => void;
}

const MetadataContext = createContext<MetadataContextProps>({
    genresMap: {},
    languagesMap: [],
    languageCount: {},
    users: [],
    dataLoaded: false,
    selectedUserId: null,
    setSelectedUserId: () => {}
});

// eslint-disable-next-line react-refresh/only-export-components
export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [genresMap, setGenresMap] = useState<GenreMap>({});
    const [languagesMap, setLanguagesMap] = useState<Language[]>([]);
    const [languageCount, setLanguageCount] = useState<LanguageCount>({});
    const [users, setUsers] = useState<UserProfileProps[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [genresRes, languagesRes]: [
                    AxiosResponse<{ id: number, name: string }[]>,
                    AxiosResponse<{ iso_639_1: string, name: string, count: number }[]>,
                    // AxiosResponse<{ lang_code: string, count: number }[]>
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/genres"),
                    axios.get("http://localhost:8000/api/languages"),
                    // axios.get("http://localhost:8000/api/languages/count")
                ]);

                const genresMapTemp: Record<number, Genre> = Object.fromEntries(
                    genresRes.data.map(g => [g.id, { id: g.id, name: g.name }])
                );

                // console.log(genresMapTemp);

                const languagesMapTemp: Language[] = languagesRes.data.map((l) => ({
                    iso_639_1: l.iso_639_1,
                    name: l.name,
                    count: l.count,
                }));
                console.log("genresMapTemp");
                console.log(languagesMapTemp)

                const languageCountTemp: Record<string, number> = Object.fromEntries(
                    languagesRes.data.map(l => [l.iso_639_1, l.count])
                );
                // const genresMapTemp = Object.fromEntries(genresRes.data.map(g => [g.id, g.name]));
                // const languagesMapTemp = Object.fromEntries(languagesRes.data.map(l => [l.iso_639_1, l.name]));
                // const languageCountTemp = Object.fromEntries(languagesRes.data.map(l => [l.iso_639_1, l.count]));

                const usersResponse: AxiosResponse<RawUser[]> = await axios.get("http://localhost:8000/api/users");
                const mappedUsers = usersResponse.data.map((user) => ({
                    ...user,
                    // favoriteGenres: user.favoriteGenres.map(
                    //     (id: number) => genresMapTemp[id] || `Unknown (${id})`
                    // ),
                    // favoriteGenres: user.favoriteGenres
                    //     .map((genre) => genresMapTemp[genre.id]),
                        // .filter((genre) => genre),
                    favoriteGenres: user.favoriteGenres
                        .map((id: number) => genresMapTemp[id])
                        .filter((genre): genre is Genre => genre !== undefined),

                    // languagePreferences: user.languagePreferences.map(
                    // (code: string) => languagesMapTemp[code] || `Unknown (${code})`
                    // ),
                    languagePreferences: user.languagePreferences
                        .map((iso_639_1: string) => languagesMapTemp.find((lang) => lang.iso_639_1 === iso_639_1))
                        .filter((lang): lang is Language => lang !== undefined),
                }));

                setGenresMap(genresMapTemp);
                setLanguagesMap(languagesMapTemp);
                setLanguageCount(languageCountTemp);
                setUsers(mappedUsers);
                console.log(mappedUsers);
                setDataLoaded(true);

            }
            catch (error) {
                console.error("Error loading metadata", error);
            }
        };
        fetchMetadata();
    }, []);

    return (
        <MetadataContext.Provider value={{ genresMap, languagesMap, languageCount, users, dataLoaded, selectedUserId, setSelectedUserId }}>
            {children}
        </MetadataContext.Provider>
    );
};
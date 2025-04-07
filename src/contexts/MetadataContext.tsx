import React, { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

type GenreMap = Record<number, string>;
type LanguageMap = Record<string, string>;

interface MetadataContextProps {
    genresMap: GenreMap;
    languagesMap: LanguageMap;
    dataLoaded: boolean;
    selectedUserId: number | null;
    setSelectedUserId: (id: number | null) => void;
}

const MetadataContext = createContext<MetadataContextProps>({
    genresMap: {},
    languagesMap: {},
    dataLoaded: false,
    selectedUserId: null,
    setSelectedUserId: () => {}
});

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [genresMap, setGenresMap] = useState<GenreMap>({});
    const [languagesMap, setLanguagesMap] = useState<LanguageMap>({});
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [genresRes, languagesRes]: [
                    AxiosResponse<{ id: number, name: string }[]>,
                    AxiosResponse<{ iso_639_1: string, name: string }[]>
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/genres"),
                    axios.get("http://localhost:8000/api/languages")
                ]);

                setGenresMap(Object.fromEntries(genresRes.data.map(g => [g.id, g.name])));
                setLanguagesMap(Object.fromEntries(languagesRes.data.map(l => [l.iso_639_1, l.name])));
                setDataLoaded(true);
            } catch (error) {
                console.error("Error loading metadata", error);
            }
        };

        fetchMetadata();
    }, []);

    return (
        <MetadataContext.Provider value={{ genresMap, languagesMap, dataLoaded, selectedUserId, setSelectedUserId }}>
            {children}
        </MetadataContext.Provider>
    );
};

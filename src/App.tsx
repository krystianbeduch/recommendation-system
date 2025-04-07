import "./App.css";
import UserProfile from "./components/UserProfile.tsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "./theme";
import React, { useEffect, useState } from "react";
import Movie from "./components/Movie.tsx";
import axios, { AxiosResponse } from "axios";
import { RawUser, UserProfileProps, Genre, Language } from "./types";

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfileProps | null>(null);
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});
  const [languagesMap, setLanguagesMap] = useState<Record<string, string>>({});
  const [userData, setUserData] = useState<RawUser | null>(null);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const loadUserById = async (userId: number): Promise<void> => {
    try {
      const response: AxiosResponse<RawUser> = await axios.get<RawUser>(
        `http://localhost:8000/api/users/${userId}`
      );
      setUserData(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching user:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const fetchMetadata = async (): Promise<void> => {
    try {
      const [genresRes, languageRes]: [
        AxiosResponse<Genre[]>,
        AxiosResponse<Language[]>,
      ] = await Promise.all([
        axios.get<Genre[]>("http://localhost:8000/api/genres"),
        axios.get<Language[]>("http://localhost:8000/api/languages"),
      ]);

      const genres = Object.fromEntries(
        genresRes.data.map(({ id, name }) => [id, name])
      );
      const languages = Object.fromEntries(
        languageRes.data.map(({ iso_639_1, name }) => [iso_639_1, name])
      );

      setGenresMap(genres);
      setLanguagesMap(languages);
      setDataLoaded(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching metadata:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      loadUserById(12345);
    }
  }, [dataLoaded]);

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
        username: userData.username,
        favoriteGenres: mappedGenres,
        languagePreferences: mappedLanguages,
        onEditProfile: () => console.log("Przejdź do edycji profilu"),
        onChangeProfile: () => loadUserById(123456),
      };

      setUser(transformedUser);
    }
  }, [userData, genresMap, languagesMap]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {user ? (
        <UserProfile
          {...user} // Przekazujemy caly obiekt bez rozbijania
        />
      ) : (
        <div>Ładowanie danych użytkownika...</div>
      )}

      <Movie></Movie>
    </ThemeProvider>
  );
};

export default App;

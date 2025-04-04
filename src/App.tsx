import './App.css'
import UserProfile from "./components/UserProfile.tsx";
import { ThemeProvider, CssBaseline } from '@mui/material';
import darkTheme from './theme';
import React from 'react';

const App: React.FC = () => {

    const userData = {
        username: "User1",
        favoriteGenres: ["Science-Fiction", "Thriller", "Documentary", "Crime", "Science-Fiction", "Science-Fiction", "Science-Fiction", "Science-Fiction", "Science-Fiction", "Science-Fiction" ],
        languagePreferences: ["Polski (Polish)", "English", "Español (Spanish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)" , "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", "Türkçe (Turkish)", ]
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <UserProfile
                username={userData.username}
                favoriteGenres={userData.favoriteGenres}
                languagePreferences={userData.languagePreferences}
                onEditProfile={() => console.log('Przejdź do edycji profilu')}
            />
        </ThemeProvider>
    );
}

export default App;
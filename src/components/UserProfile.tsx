import { Avatar, Button, Chip, Container, Grid, Paper, Typography } from '@mui/material';
import { Favorite, Language } from '@mui/icons-material';

interface UserProfileProps {
    username: string;
    favoriteGenres: string[];
    languagePreferences: string[];
    onEditProfile: () => void;
}

const UserProfile = ({
    username,
    favoriteGenres,
    languagePreferences,
    onEditProfile,
}: UserProfileProps) => {

    return (
        // <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', height: '100vh'}}>
        <>
            <Container
                disableGutters
                // maxWidth="md"
                sx={{
                    width: '60vw',
                    minWidth: '250px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                }}>
                {/* Container z MUI ogranicza szerokosc i dodaje margines na gorze (mt: 4) - margines 4*8px = 32px */}
                {/* maxWidth="md" - szerokosc komponentu to maksymalne medium (960px na desktopie) */}

                {/* Paper z UI tworzy tlo w formie kartki z cieniem (eleveation={3}) i paddingiem 2 */}
                <Paper elevation={3} sx={{p: 2}}>

                    {/* Uklad siatkowy z odstępami 2 */}
                    <Grid container spacing={2} alignItems="center">

                        {/* Lewa strona - avatar, nazwa, przycisk */}
                        {/*<Grid item xs={12} sx={{ textAlign: 'center' }}>*/}
                        <Grid component="div" sx={{textAlign: 'center'}}>

                            {/* Avatar wyswietla inicjal uzytkownika jako ikone */}
                            <Avatar sx={{
                                width: 80,
                                height: 80,
                                fontSize: '2rem',
                                margin: '0 auto 1rem'
                            }}>
                                {username[0].toUpperCase()}
                            </Avatar>

                            {/* Nazwa uzytkownika */}
                            <Typography variant="h5" component="h1" gutterBottom>
                                {username}
                            </Typography>

                            {/* Przycisk edycji */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                onClick={onEditProfile}
                            >
                                Edit profile
                            </Button>
                        </Grid>

                        {/* Prawo strona - gatunki + jezyki */}
                        <Grid container spacing={1}>
                            {/*<Grid item xs={12} md={8}>*/}
                            {/*<Grid container spacing={2} justifyContent="flex-start">*/}

                            <Grid sx={{maxWidth: 350}} component="div">

                                {/* Paper - sekcja dostaje osobne tlo i padding */}
                                <Paper sx={{p: 1, maxHeight: 200, overflowY: 'auto'}}>

                                    {/* Ulubione gatunki z ikonka serca (Favorite) */}
                                    <Typography variant="h6" gutterBottom>
                                        <Favorite sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Favorite genres
                                    </Typography>

                                    {favoriteGenres.length > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.3rem',
                                            maxWidth: '100%'
                                        }}>
                                            {favoriteGenres.map((genre) => (
                                                <Chip key={genre} label={genre} color="primary" variant="outlined"/>
                                            ))}
                                        </div>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No selected movie genres
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>

                            {/* Sekcja preferencji językowych */}
                            <Grid sx={{maxWidth: 350}} component="div">
                                <Paper sx={{p: 1, maxHeight: 200, overflowY: 'auto'}}>
                                    <Typography variant="h6" gutterBottom>
                                        <Language sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Language preferences
                                    </Typography>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.3rem',
                                        maxWidth: '100%'
                                    }}>
                                        {languagePreferences.map((lang) => (
                                            <Chip key={lang} label={lang} color="secondary" variant="outlined"/>
                                        ))}
                                    </div>
                                </Paper>
                            </Grid>
                        </Grid>
                        {/*</Grid>*/}
                        {/*</Grid>*/}
                    </Grid>
                </Paper>
            </Container>

            {/*<div style={{flexGrow: 1}}>SAS</div>*/}
            {/*<div>asas</div>*/}
        </>

    );
};

export default UserProfile;
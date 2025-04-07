import { Avatar, Button, Chip, Container, Grid, Paper, Typography, Stack } from '@mui/material';
import { Favorite, Language } from '@mui/icons-material';
import React from "react";
import { UserProfileProps } from "../types.ts";

const renderChips = (items: string[], color: "primary" | "secondary") => {
    return items.length > 0 ? (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3rem',
            maxWidth: '100%',
        }}>
            {items.map(item => (
                <Chip key={item} label={item} color={color} variant="outlined" />
            ))}
        </div>
    ) : (
        <Typography variant="body2" color="textSecondary">
            No selected items
        </Typography>
    )
}

const UserProfile: React.FC<UserProfileProps> = ({
    username = "Anonymous", // Wartosc domyslna
    favoriteGenres = [],
    languagePreferences = [],
    onEditProfile,
    onChangeProfile,
}: UserProfileProps) => {

    return (
        <>
            <Container
                disableGutters
                sx={{
                    width: '65vw',
                    minWidth: '250px',
                    // height: '100vh',
                    // position: 'fixed',
                    // left: 0,
                    // top: 0,
                }}>
                {/* Container z MUI */}

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
                                {username ? username[0].toUpperCase() : "?"}
                            </Avatar>

                            {/* Nazwa uzytkownika */}
                            <Typography variant="h5" component="h1" gutterBottom>
                                {username}
                            </Typography>

                            {/* Przycisk edycji */}
                            <Stack spacing={1} direction="column" alignItems="center">
                                <Button variant="contained" color="primary" size="medium" onClick={onEditProfile}>
                                    Edit Profile
                                </Button>
                                <Button variant="contained" color="secondary" size="medium" onClick={onChangeProfile}>
                                    Change Profile
                                </Button>
                            </Stack>
                            {/*<Button*/}
                            {/*    variant="contained"*/}
                            {/*    color="primary"*/}
                            {/*    size="medium"*/}
                            {/*    onClick={onEditProfile}*/}
                            {/*>*/}
                            {/*    Edit profile*/}
                            {/*</Button>*/}

                            {/*<Button variant="contained" color="secondary" size="medium" onClick={onChangeProfile}>*/}
                            {/*    Change Profile*/}
                            {/*</Button>*/}

                            {/*<Button*/}
                            {/*    variant="contained"*/}
                            {/*    color="primary"*/}
                            {/*    size="medium"*/}
                            {/*    onClick={onEditProfile}*/}
                            {/*>*/}
                            {/*    Change profile*/}
                            {/*</Button>*/}
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
                                    {renderChips(favoriteGenres, "primary")}
                                </Paper>
                            </Grid>

                            {/* Sekcja preferencji jezykowych */}
                            <Grid sx={{maxWidth: 350}} component="div">
                                <Paper sx={{p: 1, maxHeight: 200, overflowY: 'auto'}}>
                                    <Typography variant="h6" gutterBottom>
                                        <Language sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Language preferences
                                    </Typography>
                                    {renderChips(languagePreferences, "secondary")}
                                </Paper>
                            </Grid>
                        </Grid>
                        {/*</Grid>*/}
                        {/*</Grid>*/}
                    </Grid>
                </Paper>
            </Container>
        </>
    );
};

export default UserProfile;
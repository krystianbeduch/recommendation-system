import { Favorite, Language } from '@mui/icons-material';
import { Avatar, Button, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { UserProfileProps } from '../types.ts';

const renderChips = (items: string[], color: "primary" | "secondary") => {
    return items.length > 0 ? (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.3rem",
            maxWidth: "100%",
        }}>
            {items.map(item => (
                <Chip key={item} label={item} color={color} variant="outlined"/>
            ))}
        </div>
    ) : (
        <Typography variant="body2" color="textSecondary">
            No selected items
        </Typography>
    )
};

const UserProfile: React.FC<UserProfileProps> = ({
    username = "Anonymous", // Wartosc domyslna
    favoriteGenres = [],
    languagePreferences = [],
    onEditProfile,
    onChangeProfile,
}: UserProfileProps) => {

    return (
        <>
            {/* Container z MUI */}
            <Container
                disableGutters
                sx={{
                    width: '65vw',
                    minWidth: '250px',
                }}>

                {/* Paper z UI tworzy tlo w formie kartki z cieniem (eleveation={3}) i paddingiem 2 */}
                <Paper elevation={3} sx={{ p: 2 }}>

                    {/* Uklad siatkowy z odstępami 2 */}
                    <Grid container spacing={2} alignItems="center">

                        {/* Lewa strona - avatar, nazwa, przycisk */}
                        <Grid component="div" sx={{ textAlign: 'center' }}>

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

                            {/* Przyciski */}
                            <Stack spacing={1} direction="column" alignItems="center">
                                <Button variant="contained" color="primary" size="medium" onClick={onEditProfile}>
                                    Edit Profile
                                </Button>
                                <Button variant="contained" color="secondary" size="medium" onClick={onChangeProfile}>
                                    Change Profile
                                </Button>
                            </Stack>

                        </Grid>

                        {/* Prawo strona - gatunki + jezyki */}
                        <Grid container spacing={1}>
                            <Grid sx={{ maxWidth: 350 }} component="div">

                                {/* Paper - sekcja dostaje osobne tlo i padding */}
                                <Paper sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>

                                    {/* Ulubione gatunki z ikonka serca (Favorite) */}
                                    <Typography variant="h6" gutterBottom>
                                        <Favorite sx={{ verticalAlign: 'middle', mr: 1 }}/>
                                        Favorite genres
                                    </Typography>
                                    {renderChips(favoriteGenres, "primary")}
                                </Paper>
                            </Grid>

                            {/* Sekcja preferencji jezykowych */}
                            <Grid sx={{ maxWidth: 350 }} component="div">
                                <Paper sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
                                    <Typography variant="h6" gutterBottom>
                                        <Language sx={{ verticalAlign: 'middle', mr: 1 }}/>
                                        Language preferences
                                    </Typography>
                                    {renderChips(languagePreferences, "secondary")}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </>
    );
};

export default UserProfile;
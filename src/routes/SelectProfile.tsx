import { Container, Grid, Typography } from '@mui/material';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import UserProfileCard from '../components/UserProfileCard';
import { useMetadata } from '../contexts/MetadataContext';
import { RawUser, UserProfileProps } from '../types.ts';

const SelectProfile: React.FC = () => {
    const [users, setUsers] = useState<UserProfileProps[]>([]);
    const { genresMap, languagesMap, dataLoaded, selectedUserId, setSelectedUserId } = useMetadata();

    useEffect(() => {
        axios
            .get<RawUser[]>('http://localhost:8000/api/users')
            .then((response: AxiosResponse<RawUser[]>) => {
                const mappedUsers = response.data.map((user) => ({
                    ...user,
                    favoriteGenres: user.favoriteGenres.map(
                        (id: number) => genresMap[id] || `Unknown (${id})`
                    ),
                    languagePreferences: user.languagePreferences.map(
                        (code: string) => languagesMap[code] || `Unknown (${code})`
                    ),
                }));

                setUsers(mappedUsers);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching recommended movies: ", error.message);
            });
    }, [genresMap, languagesMap]);

    if (!dataLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Select Your Profile</Typography>
            <Grid container spacing={2}>
                {users.map(user => (
                    <Grid component="div" key={user.userId}>
                        <UserProfileCard
                            user={user}
                            onSelect={() => setSelectedUserId(user.userId)}
                            isSelected={user.userId === selectedUserId}
                        >
                        </UserProfileCard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
};

export default SelectProfile;
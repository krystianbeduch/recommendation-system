import React, {useEffect, useState} from "react";
import {RawUser, UserProfileProps} from "../types.ts";
import axios, {AxiosError, AxiosResponse} from "axios";
import { Container, Grid, Typography } from "@mui/material";
// import UserCard from "../components/UserCard.tsx";
// import UserProfile from "../components/UserProfile.tsx";
import UserProfileCard from "../components/UserProfileCard.tsx";
import { useMetadata } from "../contexts/MetadataContext"; // dopasuj ścieżkę!


const SelectProfile: React.FC = () => {
    const [users, setUsers] = useState<UserProfileProps[]>([]);
    // const [selectedId, setSelectedId] = useState<number | null>(null);
    // const { selectedUserId, setSelectedUserId } = useMetadata();


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
                    onEditProfile: () => console.log("Edit profile"),
                    onChangeProfile: () => window.location.href = "/"
                }));

                setUsers(mappedUsers);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching recommended movies: ", error.message);
            });
    }, [genresMap, languagesMap]);

    if (!dataLoaded)
        return <div>Loading...</div>;
    console.log(`id: ${selectedUserId}`);

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
                        {/*<UserCard*/}
                        {/*    user={user}*/}
                        {/*    isSelected={user.userId === selectedId}*/}
                        {/*    onSelect={() => setSelectedId(user.userId)}*/}
                        {/*/>*/}
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
};

export default SelectProfile;
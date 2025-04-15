import { Container, Grid, Typography } from '@mui/material';
import React from 'react';
import UserProfileCard from '../components/UserProfileCard';
import { useMetadata } from '../contexts/MetadataContext';

const SelectProfile: React.FC = () => {
    const { dataLoaded, users, selectedUserId, setSelectedUserId } = useMetadata();

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
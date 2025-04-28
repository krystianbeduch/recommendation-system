    import { Box, Container, Grid, IconButton, Typography } from '@mui/material';
    import PersonAddIcon from '@mui/icons-material/PersonAdd';
    import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import UserProfileCard from '../components/UserProfileCard';
    import { useMetadata } from '../contexts/MetadataContext';

    const SelectProfile: React.FC = () => {
        const { dataLoaded, users, selectedUserId, setSelectedUserId } = useMetadata();
        const navigate = useNavigate();

        if (!dataLoaded) {
            return <div>Loading...</div>;
        }

        const handleAddProfile = () => {
            navigate("/add-profile");
        };

        return (
            <Container>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h4">Select Your Profile</Typography>
                    <IconButton
                        color="primary"
                        onClick={handleAddProfile}
                        sx={{
                            ml: 2,
                            color: "black",
                            backgroundColor: "primary.main",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                            },
                            width: 45,
                            height: 45
                        }} >
                        <PersonAddIcon fontSize="large" />
                    </IconButton>
                </Box>
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
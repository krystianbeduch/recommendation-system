import { Avatar, Button, Box, Paper, Typography, Chip } from '@mui/material';
import { Favorite, Language } from '@mui/icons-material';

import React from "react";
import {UserProfileProps} from "../types.ts";
import {useNavigate} from "react-router-dom";
import {useMetadata} from "../contexts/MetadataContext.tsx";

interface UserProfileCardProps {
    user: UserProfileProps,
    onSelect: () => void;
    isSelected: boolean;
}

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

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onSelect, isSelected }) => {
    const { selectedUserId } = useMetadata();
    console.log(`userCard ${selectedUserId}`);
    const navigate = useNavigate();
    const handleClick = () => {
        onSelect();
        navigate("/dashboard");
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                m: 2,
                width: 300,
                border: isSelected ? "2px solid #1976d2" : "1px solid gray",
                backgroundColor: isSelected ? "rgb(25, 118, 210, 0.1)" : "inherit",
                display: "flex",
                flexDirection: "column",
                maxHeight: "550px",
                overflowY: "auto",
            }}
        >
            <Box textAlign="center">
                <Avatar sx={{width: 60, height: 60, fontSize: '1.5rem', mx: 'auto', mb: 1}}>
                    {user.username[0]?.toUpperCase() || "?"}
                </Avatar>
                <Typography variant="h6">{user.username}</Typography>
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle1">
                    <Favorite sx={{fontSize: 18, mr: 0.5, verticalAlign: 'middle'}}/>
                    Favorite genres
                </Typography>
                {renderChips(user.favoriteGenres, "primary")}
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle1">
                    <Language sx={{fontSize: 18, mr: 0.5, verticalAlign: 'middle'}}/>
                    Language preferences
                </Typography>
                {renderChips(user.languagePreferences, "secondary")}
            </Box>

            <Box mt={3} textAlign="center">
                <Button variant="contained" onClick={handleClick}>Select Profile</Button>
            </Box>
        </Paper>
    );
};

export default UserProfileCard;
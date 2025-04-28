import { Delete, Favorite, Language } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, IconButton, Paper, Typography } from '@mui/material';
import axios from "axios";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMetadata } from '../contexts/MetadataContext';
import { UserProfileCardProps } from '../types.ts';

const renderChips = (items: string[], color: "primary" | "secondary") => {
    return items.length > 0 ? (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3rem',
            maxWidth: '100%',
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
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onSelect, isSelected }) => {
    const { selectedUserId } = useMetadata();
    console.log(`userCard ${selectedUserId}`);

    const navigate = useNavigate();
    const handleClick = () => {
        onSelect();
        navigate("/dashboard");
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
            try {
                await axios.delete(`http://localhost:8000/api/users/${user.userId}`);
                window.location.reload();
            }
            catch (error) {
                console.error("Failed to delete user:", error);
            }
        }
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
                position: "relative"
            }}
        >
            <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "white",
                    backgroundColor: "error.main",
                    '&:hover': {
                        backgroundColor: 'error.dark',
                    },
                    width: 32,
                    height: 32,
                }}
            >
                <Delete fontSize="small" />
            </IconButton>

            <Box textAlign="center">
                <Avatar sx={{ width: 60, height: 60, fontSize: '1.5rem', mx: 'auto', mb: 1 }}>
                    {user.username[0]?.toUpperCase() || "?"}
                </Avatar>
                <Typography variant="h6">{user.username}</Typography>
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle1">
                    <Favorite sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }}/>
                    Favorite genres
                </Typography>
                {renderChips(user.favoriteGenres.map(genre => genre.name), "primary")}
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle1">
                    <Language sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }}/>
                    Language preferences
                </Typography>
                {renderChips(user.languagePreferences.map(lang => lang.name), "secondary")}
            </Box>

            <Box mt={3} textAlign="center">
                <Button variant="contained" onClick={handleClick}>Select Profile</Button>
            </Box>
        </Paper>
    );
};

export default UserProfileCard;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Movie from '../components/Movie';
import UserProfileDashboard from '../components/UserProfilePage';
import { useMetadata } from '../contexts/MetadataContext';
import { UserProfileProps } from '../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { dataLoaded, selectedUserId } = useMetadata();
    console.log("s");
    console.log(selectedUserId);

    useEffect(() => {
        if (!selectedUserId) {
            navigate("/");
        }
    }, [selectedUserId, navigate]);

    const [user, setUser] = useState<UserProfileProps | null>(null);
    const { users } = useMetadata();

    // Zaladowanie uzytkownika na podstawie parametru id
    useEffect(() => {
        const foundUser = users.find((user) => user.userId === selectedUserId);
        if (foundUser) {
            const transformedUser: UserProfileProps = {
                userId: foundUser.userId,
                username: foundUser.username,
                favoriteGenres: foundUser.favoriteGenres,
                languagePreferences: foundUser.languagePreferences,
                onEditProfile: () => navigate(`/edit-profile/${foundUser.userId}`),
                onChangeProfile: () => navigate("/")
            };
            setUser(transformedUser)
        }
    }, [selectedUserId, users, navigate, dataLoaded]);

    return user ? (
        <>
            <UserProfileDashboard {...user} />
            <Movie userId={user.userId}/>
        </>
    ) : (
        <div>Loading user...</div>
    )
};

export default Dashboard;
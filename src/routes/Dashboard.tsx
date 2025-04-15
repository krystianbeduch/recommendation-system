import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Movie from '../components/Movie';
import UserProfilePage from '../components/UserProfilePage.tsx';
import { useMetadata } from '../contexts/MetadataContext';
import { UserProfileProps } from '../types.ts';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { dataLoaded, selectedUserId } = useMetadata();
    console.log(selectedUserId);
    // if (!selectedUserId) {
    //     navigate("/");
    // }
    useEffect(() => {
        if (!selectedUserId) {
            navigate("/");
        }
    }, [selectedUserId, navigate]);

    const [user, setUser] = useState<UserProfileProps | null>(null);
    // const [userData, setUserData] = useState<RawUser | null>(null);
    const { users } = useMetadata();
    




    // const loadUserById = async (selectedUserId: number): Promise<void> => {
    //     try {
    //         const response: AxiosResponse<RawUser> = await axios.get<RawUser>(
    //             `http://localhost:8000/api/users/${selectedUserId}`
    //         );
    //         setUserData(response.data);
    //     }
    //     catch (error: unknown) {
    //         if (axios.isAxiosError(error)) {
    //             console.error("Error fetching user:", error.message);
    //         }
    //         else {
    //             console.error("Unexpected error:", error);
    //         }
    //     }
    // };
    

    // // Klikniecie przycisku "Change profile"
    // useEffect(() => {
    //     if (dataLoaded && selectedUserId) {
    //         loadUserById(selectedUserId);
    //     }
    // }, [dataLoaded, selectedUserId]);

    console.log("user dasbboard")
    console.log(user);

    // // Mapowanie gatunkow i jezykow dla profilu uzytkownika
    useEffect(() => {
        const foundUser = users.find((user) => user.userId === selectedUserId);
        console.log("hasboard")
        console.log(foundUser);
        if (foundUser) {
            const transformedUser: UserProfileProps = {
                userId: foundUser.userId,
                username: foundUser.username,
                // favoriteGenres: mappedGenres,
                favoriteGenres: foundUser.favoriteGenres,
                languagePreferences: foundUser.languagePreferences,
                onEditProfile: () => navigate(`/edit-profile/${foundUser.userId}`),
                onChangeProfile: () => navigate("/")
            };
            setUser(transformedUser)
        }


        // if (findedUser) {
        //     setUser(findedUser);
        // }
    }, [selectedUserId, users, navigate, dataLoaded]);
    console.log(user);
    //     if (
    //         user
    //         // userData &&
    //         // Object.keys(genresMap).length > 0 &&
    //         // Object.keys(languagesMap).length > 0
    //     ) {
    //
    //         // Mapowanie gatunkow i jezykow
    //         const mappedGenres = userData.favoriteGenres.map(
    //             (id: number) => genresMap[id] || `Unknown (${id})`
    //         );
    //
    //         const mappedLanguages = userData.languagePreferences.map(
    //             (code: string) => languagesMap[code] || `Unknown (${code})`
    //         );
    //
    //         const transformedUser: UserProfileProps = {
    //             userId: userData.userId,
    //             username: userData.username,
    //             // favoriteGenres: mappedGenres,
    //             favoriteGenres: user.favoriteGenres,
    //             languagePreferences: mappedLanguages,
    //             onEditProfile: () => navigate(`/edit-profile/${user?.userId}`),
    //             onChangeProfile: () => navigate("/")
    //         };
    //
    //         setUser(transformedUser);
    //     }
    // }, [userData, genresMap, languagesMap, navigate, user?.userId]);

    return user ? (
        <>
            <UserProfilePage {...user} />
            <Movie userId={user.userId}/>
        </>
    ) : (
        <div>Loading user...</div>
    )
};

export default Dashboard;
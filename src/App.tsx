import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AddNewProfileForm from './components/AddNewProfileForm';
import EditProfileForm from './components/EditProfileForm';
import Dashboard from './routes/Dashboard';
import SelectProfile from './routes/SelectProfile';
import darkTheme from './theme';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SelectProfile/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/edit-profile/:userId" element={<EditProfileForm/>}/>
                    <Route path="/add-profile" element={<AddNewProfileForm/>}/>
                    <Route path="*" element={<Navigate to="/"/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9', // niebieski akcent
        },
        secondary: {
            main: '#f48fb1', // różowy akcent
        },
        background: {
            default: '#121212', // czarne tło
            paper: '#1e1e1e', // ciemnoszare tło dla komponentów
        },
        text: {
            primary: '#ffffff', // białe teksty
            secondary: '#b0bec5', // lekko szare teksty
        },
    },
});

export default darkTheme;
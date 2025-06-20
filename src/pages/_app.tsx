import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '../styles/globals.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider
            session={pageProps.session}
            refetchInterval={300}
            refetchOnWindowFocus={false}
            refetchWhenOffline={false}
        >
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Koleksiyon Yönetim Platformu</title>
            </Head>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Component {...pageProps} />
            </ThemeProvider>
        </SessionProvider>
    );
}
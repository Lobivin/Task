import React, { memo } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const Layout = memo<LayoutProps>(({ children, title = 'Koleksiyon Yönetim Platformu', description }) => {
    const router = useRouter();
    const { data: session } = useSession();

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            await router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <Head>
                <title>{title}</title>
                {description && <meta name="description" content={description} />}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Box className="min-h-screen flex flex-col">
                <AppBar position="static" elevation={1}>
                    <Container maxWidth="lg">
                        <Toolbar disableGutters>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ flexGrow: 1, cursor: 'pointer' }}
                                onClick={() => router.push('/collections')}
                            >
                                Koleksiyon Yönetim Platformu
                            </Typography>
                            {session && (
                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    aria-label="Çıkış Yap"
                                >
                                    Çıkış Yap
                                </Button>
                            )}
                        </Toolbar>
                    </Container>
                </AppBar>

                <Box component="main" className="flex-1">
                    {children}
                </Box>

                <Box component="footer" className="bg-gray-100 p-4 text-center">
                    <Container maxWidth="lg">
                        <Typography variant="body2" color="textSecondary">
                            &copy; {new Date().getFullYear()} Koleksiyon Yönetim Platformu. Tüm hakları saklıdır.
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </>
    );
});

Layout.displayName = 'Layout';

export default Layout;
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import LoginForm from '@/components/LoginForm'
import { Container, Box, Typography, Paper } from '@mui/material'
import {authOptions} from "@/lib/auth";

export default function LoginPage() {
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Koleksiyon Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Hesabınıza giriş yapın
                    </Typography>
                    <LoginForm />
                </Paper>
            </Box>
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(context.req, context.res, authOptions)

    if (session) {
        return {
            redirect: {
                destination: '/collections',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}
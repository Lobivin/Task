import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import {
    useAuth,
    useDebounce,
    useLocalStorage,
    useErrorHandler
} from '@/hooks';

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginForm() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
    const { handleError, clearError: clearHandlerError } = useErrorHandler();

    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string>('');

    const debouncedUsername = useDebounce(formData.username, 500);

    const [rememberedUsername, setRememberedUsername] = useLocalStorage<string>('rememberedUsername', '');

    const [usernameError, setUsernameError] = useState<string>('');

    useEffect(() => {
        if (rememberedUsername && !formData.username) {
            setFormData(prev => ({ ...prev, username: rememberedUsername }));
        }
    }, [rememberedUsername]);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const callbackUrl = (router.query.callbackUrl as string) || '/collections';
            router.push(callbackUrl);
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (debouncedUsername) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(debouncedUsername)) {
                setUsernameError('Geçerli bir email adresi giriniz');
            } else {
                setUsernameError('');
            }
        } else {
            setUsernameError('');
        }
    }, [debouncedUsername]);

    useEffect(() => {
        if (localError) {
            setLocalError('');
        }
        if (error) {
            clearError();
        }
    }, [formData, error, clearError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLocalError('');
        clearError();
        clearHandlerError();

        if (!formData.username.trim()) {
            setLocalError('Email adresi gereklidir');
            return;
        }

        if (!formData.password.trim()) {
            setLocalError('Şifre gereklidir');
            return;
        }

        if (usernameError) {
            setLocalError('Lütfen geçerli bir email adresi giriniz');
            return;
        }

        try {
            const success = await login({
                username: formData.username.trim(),
                password: formData.password,
            });

            if (success) {
                setRememberedUsername(formData.username.trim());
            } else {
                const errorMessage = error || 'Geçersiz email veya şifre';
                setLocalError(errorMessage);
                handleError(errorMessage);
            }
        } catch (err: any) {
            console.error('Login hatası:', err);
            let errorMessage = 'Giriş yapılırken bir hata oluştu';

            if (err.response?.data?.data?.errors) {
                const errors = err.response.data.data.errors;
                if (errors.Username) {
                    errorMessage = errors.Username[0] || 'Kullanıcı adı hatası';
                } else if (errors.Password) {
                    errorMessage = errors.Password[0] || 'Şifre hatası';
                }
            } else if (err.response?.status === 401) {
                errorMessage = 'Geçersiz email veya şifre';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setLocalError(errorMessage);
            handleError(errorMessage);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const isFormValid =
        formData.username.trim() &&
        formData.password.trim() &&
        !usernameError &&
        !isLoading;

    const displayError = localError || error;

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {displayError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => {
                        setLocalError('');
                        clearError();
                    }}
                >
                    {displayError}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Email Adresi"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                error={!!usernameError}
                helperText={usernameError || 'Email adresinizi kullanıcı adı olarak giriniz'}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Email />
                        </InputAdornment>
                    ),
                }}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Lock />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="şifre görünürlüğünü değiştir"
                                onClick={togglePasswordVisibility}
                                edge="end"
                                disabled={isLoading}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!isFormValid}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
        </Box>
    );
}
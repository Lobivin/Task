import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useSession, signOut } from 'next-auth/react';
import { LoginCredentials } from '@/types';

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    refreshToken,
    isHydrated,
    login: storeLogin,
    logout: storeLogout,
    refreshAuth,
    initializeAuth,
    clearError,
  } = useAuthStore();

  const { data: session, status } = useSession();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && typeof window !== 'undefined') {
      initRef.current = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    return await storeLogin(credentials);
  };

  const logout = async (): Promise<void> => {
    try {
      if (status === 'authenticated') {
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('NextAuth logout error:', error);
    } finally {
      storeLogout();
    }
  };

  const getAuthToken = (): string | null => {
    return accessToken || session?.accessToken || null;
  };

  const getIsAuthenticated = (): boolean => {
    return isHydrated && (isAuthenticated || status === 'authenticated');
  };

  const getIsLoading = (): boolean => {
    return !isHydrated || isLoading || status === 'loading';
  };

  return {
    isAuthenticated: getIsAuthenticated(),
    isLoading: getIsLoading(),
    isHydrated,
    error,
    user: session?.user || null,
    accessToken: getAuthToken(),
    refreshToken,

    login,
    logout,
    refreshAuth,
    clearError,
  };
};
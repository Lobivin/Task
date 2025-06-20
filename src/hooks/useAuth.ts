import { useAuthStore } from '@/hooks/useAuthStore';

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    refreshToken,
    isHydrated,
    login,
    logout,
    refreshAuth,
    initializeAuth,
    clearError,
  } = useAuthStore();

  return {
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    accessToken,
    refreshToken,
    login,
    logout,
    refreshAuth,
    clearError,
  };
};
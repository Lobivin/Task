import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { login, refreshTokenLogin } from '@/lib/api';
import { LoginCredentials } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  initializeAuth: () => void;
  clearError: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          accessToken: null,
          refreshToken: null,
          isHydrated: false,

          setHydrated: () => {
            set({ isHydrated: true });
          },

          initializeAuth: () => {
            const state = get();
            console.log('Auth initialization, current state:', state);
            if (state.accessToken && state.refreshToken && state.isHydrated) {
              set({ isAuthenticated: true });
            }
          },

          clearError: () => {
            set({ error: null });
          },

          login: async (credentials: LoginCredentials) => {
            set({ isLoading: true, error: null });

            try {
              const response = await login(credentials.username, credentials.password);

              if (response.status === 0 && response.data && !response.data.errors) {
                const { accessToken, refreshToken } = response.data;

                console.log('Login successful, setting tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

                set({
                  isAuthenticated: true,
                  accessToken,
                  refreshToken,
                  isLoading: false,
                  error: null,
                });

                return true;
              } else {
                let errorMessage = 'Geçersiz kullanıcı adı veya şifre';

                if (response.data?.errors) {
                  const errors = response.data.errors;
                  const errorMessages = [];

                  for (const field in errors) {
                    if (Array.isArray(errors[field])) {
                      errorMessages.push(...errors[field]);
                    }
                  }

                  if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join(', ');
                  }
                }

                set({
                  isLoading: false,
                  error: errorMessage,
                  isAuthenticated: false,
                });
                return false;
              }
            } catch (error: any) {
              let errorMessage = 'Giriş sırasında bir hata oluştu';

              if (error.response?.data) {
                const responseData = error.response.data;

                if (responseData.message) {
                  errorMessage = responseData.message;
                } else if (responseData.data?.errors) {
                  const errors = responseData.data.errors;
                  const errorMessages = [];

                  for (const field in errors) {
                    if (Array.isArray(errors[field])) {
                      errorMessages.push(...errors[field]);
                    }
                  }

                  if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join(', ');
                  }
                }
              }

              set({
                isLoading: false,
                error: errorMessage,
                isAuthenticated: false,
              });
              return false;
            }
          },

          logout: () => {
            console.log('Logging out...');
            set({
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              error: null,
            });
          },

          refreshAuth: async () => {
            const currentRefreshToken = get().refreshToken;

            if (!currentRefreshToken) {
              set({
                isAuthenticated: false,
                accessToken: null,
                refreshToken: null
              });
              return false;
            }

            set({ isLoading: true, error: null });

            try {
              const response = await refreshTokenLogin(currentRefreshToken);

              if (response.status === 0 && response.data) {
                const { accessToken, refreshToken } = response.data;

                set({
                  isAuthenticated: true,
                  accessToken,
                  refreshToken,
                  isLoading: false,
                });
                return true;
              } else {
                set({
                  isLoading: false,
                  isAuthenticated: false,
                  accessToken: null,
                  refreshToken: null,
                });
                return false;
              }
            } catch (error) {
              set({
                isLoading: false,
                isAuthenticated: false,
                accessToken: null,
                refreshToken: null,
              });
              return false;
            }
          },
        }),
        {
          name: 'auth-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            isAuthenticated: state.isAuthenticated,
          }),
          onRehydrateStorage: () => (state, error) => {
            if (error) {
              console.error('Auth rehydration error:', error);
            } else if (state) {
              console.log('Auth rehydrated:', {
                hasAccessToken: !!state.accessToken,
                hasRefreshToken: !!state.refreshToken
              });
              state.setHydrated();
              if (state.accessToken && state.refreshToken) {
                state.isAuthenticated = true;
              }
            }
          },
        }
    )
);
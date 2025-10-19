import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loading = useAuthStore((state) => state.loading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const loginUser = useAuthStore((state) => state.loginUser);
  const logout = useAuthStore((state) => state.logout);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  return {
    user,
    token,
    loading,
    isInitialized,
    loginUser,
    logout,
    initializeAuth,
  };
};

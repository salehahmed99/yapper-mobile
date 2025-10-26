import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.token !== null);

  if (!isInitialized) return null;
  if (isAuthenticated) {
    return <Redirect href="/(protected)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

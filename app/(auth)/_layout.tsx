import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  const skipRedirectAfterLogin = useAuthStore((state) => state.skipRedirectAfterLogin);

  if (!isInitialized) return null;

  if (isAuthenticated && !skipRedirectAfterLogin) {
    return <Redirect href="/(protected)/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

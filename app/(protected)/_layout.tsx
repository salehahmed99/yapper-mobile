import AppShell from '@/src/components/shell/AppShell';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect } from 'expo-router';
import React from 'react';

const ProtectedLayout = () => {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.user !== null);

  if (!isInitialized) return null;
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing-screen" />;
  }

  return <AppShell />;
};

export default ProtectedLayout;

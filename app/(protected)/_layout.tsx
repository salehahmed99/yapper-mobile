import AppShell from '@/src/components/shell/AppShell';
import React from 'react';

const ProtectedLayout = () => {
  // const isInitialized = useAuthStore((state) => state.isInitialized);
  // const isAuthenticated = useAuthStore((state) => state.token !== null);

  return <AppShell />;
};

export default ProtectedLayout;

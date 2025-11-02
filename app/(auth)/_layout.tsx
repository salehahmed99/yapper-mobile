import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

export default function AuthLayout() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Wait for store to initialize before rendering
  if (!isInitialized) return null;

  if (isAuthenticated) {
    return <Redirect href="/(protected)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="forgot-password/find-account" options={{ title: 'Forgot Password' }} />
        <Stack.Screen name="forgot-password/reset-password" options={{ title: 'Reset Password' }} />
        <Stack.Screen name="forgot-password/success-reset-password" options={{ title: 'Success' }} />
        <Stack.Screen name="forgot-password/verify-code" options={{ title: 'Verify Code' }} />
      </Stack>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
  });

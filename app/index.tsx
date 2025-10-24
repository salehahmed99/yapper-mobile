import LoginScreen from '@/app/(auth)/login';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function HomeScreenDemo() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { scrollY } = useUiShell();
  return (
    <>
      <LoginScreen />
      <Toast />
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 120,
      backgroundColor: theme.colors.background.primary,
    },
    hero: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      color: theme.colors.text.primary,
      marginBottom: 12,
      fontFamily: theme.typography.fonts.semiBold,
    },
    button: {
      backgroundColor: theme.colors.text.link,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.typography.fonts.semiBold,
    },
    card: {
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 12,
    },
    cardTitle: {
      color: theme.colors.text.primary,
      fontWeight: '700',
      marginBottom: 8,
    },
    cardBody: {
      color: theme.colors.text.secondary,
    },
  });

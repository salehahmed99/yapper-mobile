import LoginScreen from '@/app/(auth)/login';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <LoginScreen />
      <Toast />
    </>
  );
};

export default HomeScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.lg,
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.text.link,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
  });

import LoginScreen from '@/app/(auth)/login';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

const HomeScreen = () => {
  const { theme } = useTheme();
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
      marginTop: theme.spacing.md,
    },
  });

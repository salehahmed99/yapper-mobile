import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const WelcomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isAuthenticated = useAuthStore((state) => state.token !== null);

  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const scaleFonts = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(
    () => createStyles(theme, scaleWidth, scaleHeight, scaleFonts),
    [theme, scaleWidth, scaleHeight, scaleFonts],
  );

  if (isAuthenticated) {
    router.replace('/(protected)');
    return null;
  }

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome.title')}</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
        <Text style={styles.loginButtonText}>{t('welcome.goToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;

const createStyles = (theme: Theme, scaleWidth: number = 1, scaleHeight: number = 1, scaleFonts: number = 1) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg * scaleWidth,
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
      fontSize: 32 * scaleFonts,
      marginBottom: theme.spacing.sm * scaleHeight,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: 16 * scaleFonts,
      marginBottom: theme.spacing.xxl * scaleHeight,
      textAlign: 'center',
      lineHeight: 22 * scaleFonts,
    },
    loginButton: {
      paddingVertical: theme.spacing.md * scaleHeight,
      paddingHorizontal: theme.spacing.xxl * scaleWidth,
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.md,
      width: '80%',
    },
    loginButtonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: 16 * scaleFonts,
      textAlign: 'center',
    },
  });

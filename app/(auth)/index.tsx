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
  const { width } = useWindowDimensions();
  const isAuthenticated = useAuthStore((state) => state.token !== null);

  // Scale factor for responsive sizing
  const scaleFactor = Math.min(Math.max(width / 390, 0.85), 1.1);
  const styles = useMemo(() => createStyles(theme, scaleFactor), [theme, scaleFactor]);

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

const createStyles = (theme: Theme, scale: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
      fontSize: 32 * scale,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: 16 * scale,
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
      lineHeight: 22 * scale,
    },
    loginButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.md,
      width: '80%',
    },
    loginButtonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: 16 * scale,
      textAlign: 'center',
    },
  });

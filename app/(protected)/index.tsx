import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('home.title')}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>{t('buttons.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
      fontSize: 18,
    },
    logoutButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.error,
      borderRadius: 8,
    },
    logoutButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: 16,
      textAlign: 'center',
    },
  });

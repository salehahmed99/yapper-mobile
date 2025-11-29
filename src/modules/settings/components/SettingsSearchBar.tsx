import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface ISettingsSearchBarProps {
  placeholder?: string;
}

export const SettingsSearchBar: React.FC<ISettingsSearchBarProps> = ({ placeholder = 'Search settings' }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => router.push('/(protected)/(settings)/search')}
        activeOpacity={0.7}
        accessibilityLabel="Search settings"
        testID="Search_settings"
      >
        <Ionicons name="search" style={styles.searchIcon} />
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.fullRounded,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md - 2,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
      fontSize: theme.typography.sizes.xl,
      color: theme.colors.text.secondary,
    },
    placeholderText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.secondary,
    },
  });

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ISettingsSearchBarProps {
  placeholder?: string;
}

export const SettingsSearchBar: React.FC<ISettingsSearchBarProps> = ({ placeholder }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { navigate } = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const searchPlaceholder = placeholder || t('settings.search.placeholder');
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => navigate('/(protected)/(settings)/search')}
        activeOpacity={0.7}
        accessibilityLabel="Search settings"
        testID="Search_settings"
      >
        <Ionicons name="search" style={styles.searchIcon} />
        <Text style={styles.placeholderText}>{searchPlaceholder}</Text>
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

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { Search } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

interface IExploreSearchBarProps {
  onSearchPress?: () => void;
}

const ExploreSearchBar: React.FC<IExploreSearchBarProps> = ({ onSearchPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigate('/(protected)/search/search-suggestions');
    }
  };

  return (
    <Pressable
      style={styles.searchField}
      onPress={handleSearchPress}
      accessibilityLabel={t('search.placeholder')}
      accessibilityRole="search"
      testID="explore_search_field"
    >
      <Search size={18} color={theme.colors.text.secondary} />
      <Text style={styles.searchPlaceholder}>{t('search.placeholder', 'Search')}</Text>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    searchField: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    searchPlaceholder: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
    },
  });

export default ExploreSearchBar;

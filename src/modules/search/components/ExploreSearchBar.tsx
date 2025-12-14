import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useUiShell } from '@/src/context/UiShellContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Search } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IExploreSearchBarProps {
  onSearchPress?: () => void;
}

const ExploreSearchBar: React.FC<IExploreSearchBarProps> = ({ onSearchPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { toggleSideMenu, isSideMenuOpen } = useUiShell();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigate('/(protected)/search/search-suggestions');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm }]}>
      {/* User Avatar - Opens Side Menu */}
      {!isSideMenuOpen ? (
        <Pressable
          onPress={toggleSideMenu}
          accessibilityLabel={t('accessibility.openMenu')}
          testID="explore_menu_button"
          accessibilityRole="button"
          style={styles.avatarButton}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user?.avatarUrl || DEFAULT_AVATAR_URL }} style={styles.avatar} resizeMode="cover" />
          </View>
        </Pressable>
      ) : (
        <View style={styles.avatarButton} />
      )}

      {/* Search Field */}
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
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    avatarButton: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrapper: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      borderRadius: theme.ui.avatar / 2,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.tertiary,
    },
    avatar: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      borderRadius: theme.ui.avatar / 2,
    },
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

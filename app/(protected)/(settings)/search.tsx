import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { SETTINGS_DATA } from '@/src/modules/settings/components/settingsConfig';
import { View, Text, ScrollView, StyleSheet, StatusBar, TextInput, TouchableOpacity, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { getSettingsData, getYourAccountData } from '@/src/modules/settings/components/settingsConfig';
import { ISettingsItem } from '@/src/modules/settings/types/types';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

export const SettingsSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t, i18n } = useTranslation();
  const SETTINGS_DATA = useMemo(() => getSettingsData(t), [t]);
  const YOUR_ACCOUNT_DATA = useMemo(() => getYourAccountData(t), [t]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { theme, isDark } = useTheme();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const styles = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);
  // Auto-focus input when screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter settings based on search query
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return SETTINGS_DATA.filter((item) => item.title.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleItemPress = (item: ISettingsItem) => {
    // Handle navigation here
    console.log('Navigate to:', item.title);
    const query = searchQuery.trim();
    const allData = [...SETTINGS_DATA, ...YOUR_ACCOUNT_DATA];

    return allData.filter((item) => {
      const itemTitle = item.title || '';
      const queryLower = query.toLowerCase();
      const titleLower = itemTitle.toLowerCase();

      return titleLower.includes(queryLower) || itemTitle.includes(query);
    });
  }, [SETTINGS_DATA, YOUR_ACCOUNT_DATA, searchQuery]);

  const handleItemPress = (item: ISettingsItem) => {
    if (item.route) {
      router.push(`/(protected)/(settings)/${item.prefix || ''}${item.route}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            testID="Go_Back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search settings"
            placeholder={t('settings.search.placeholder')}
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="search settings input"
            testID="search_settings_input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityLabel="Clear Button"
              testID="Clear_Button"
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchQuery.trim().length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateSubtext}>
                Try searching for account, privacy, notifications, or security
              </Text>
              <Text style={styles.emptyStateSubtext}>{t('settings.search.empty_hint')}</Text>
            </View>
          ) : filteredSettings.length > 0 ? (
            <SettingsSection
              items={filteredSettings}
              onItemPress={handleItemPress}
              showChevron={true}
              showDescription={false}
              showIcons={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.noResultsTitle}>No results for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>
                The term you entered did not bring up any results. Try a different search term.
              </Text>
              <Text style={styles.noResultsTitle}>{t('settings.search.no_results', { query: searchQuery })}</Text>
              <Text style={styles.noResultsSubtext}>{t('settings.search.no_results_hint')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
const createStyles = (theme: Theme, isRTL: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: theme.borderWidth.thin,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: theme.spacing.md,
      marginRight: isRTL ? 0 : theme.spacing.md,
      marginLeft: isRTL ? theme.spacing.md : 0,
      padding: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.text.primary,
      padding: 0,
    },
    clearButton: {
      marginLeft: theme.spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
    clearButton: {
      marginLeft: isRTL ? 0 : theme.spacing.md,
      marginRight: isRTL ? theme.spacing.md : 0,
      padding: theme.spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      alignItems: isRTL ? 'flex-end' : 'flex-start',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xxl,
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      textAlign: isRTL ? 'right' : 'left',
    },
    emptyStateSubtext: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    noResultsTitle: {
      fontSize: theme.typography.sizes.xxl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: isRTL ? 'right' : 'left',
    },
    noResultsSubtext: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
  });

export default SettingsSearchScreen;

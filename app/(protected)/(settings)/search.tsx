import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { SETTINGS_DATA } from '@/src/modules/settings/settingsConfig';
import { ISettingsItem } from '@/src/modules/settings/types';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

export const SettingsSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search settings"
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
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
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
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xxl,
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    emptyStateSubtext: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      lineHeight: 20,
    },
    noResultsTitle: {
      fontSize: theme.typography.sizes.xxl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    noResultsSubtext: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.tertiary,
      lineHeight: 20,
    },
  });

export default SettingsSearchScreen;

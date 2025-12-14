import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useDebounce from '@/src/hooks/useDebounce';
import { useNavigation } from '@/src/hooks/useNavigation';
import SearchHistoryList from '@/src/modules/search/components/SearchHistoryList';
import SearchInput from '@/src/modules/search/components/SearchInput';
import SuggestedUserItem from '@/src/modules/search/components/SuggestedUserItem';
import SuggestionItem from '@/src/modules/search/components/SuggestionItem';
import useSearchHistory from '@/src/modules/search/hooks/useSearchHistory';
import { useSearchSuggestions } from '@/src/modules/search/hooks/useSearchSuggestions';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function SearchSuggestionsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const params = useLocalSearchParams<{ query?: string; username?: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [query, setQuery] = useState(params.query || '');
  const username = params.username || undefined;
  const isProfileSearch = username !== undefined;

  const debouncedQuery = useDebounce(query.trim(), 300);

  const placeholder = isProfileSearch ? t('search.searchUserPosts', { username: `@${username}` }) : undefined;

  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const { data, isLoading } = useSearchSuggestions({
    query: debouncedQuery,
    username,
    enabled: debouncedQuery.length > 0,
  });

  const suggestions = data?.data?.suggestedQueries ?? [];
  const users = isProfileSearch ? [] : (data?.data?.suggestedUsers ?? []);

  const handleQueryPress = useCallback(
    (selectedQuery: string) => {
      addToHistory(selectedQuery);
      navigate({
        pathname: '/(protected)/search/search-results' as any,
        params: { query: selectedQuery, ...(username && { username }) },
      });
    },
    [navigate, username, addToHistory],
  );

  const handleArrowPress = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
  }, []);

  const handleUserPress = useCallback(
    (userId: string) => {
      navigate({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: userId },
      });
    },
    [navigate],
  );

  const handleSubmit = useCallback(() => {
    if (query.trim().length > 0) {
      handleQueryPress(query.trim());
    }
  }, [query, handleQueryPress]);

  const handleHistoryItemPress = useCallback(
    (selectedQuery: string) => {
      handleQueryPress(selectedQuery);
    },
    [handleQueryPress],
  );

  const renderSuggestionItem = useCallback(
    ({ item }: { item: (typeof suggestions)[0] }) => (
      <SuggestionItem suggestion={item} onPress={handleQueryPress} onArrowPress={handleArrowPress} />
    ),
    [handleQueryPress, handleArrowPress],
  );

  const renderUserItem = useCallback(
    ({ item }: { item: (typeof users)[0] }) => <SuggestedUserItem user={item} onPress={handleUserPress} />,
    [handleUserPress],
  );

  const ListHeader = useMemo(
    () => (
      <>
        {/* Suggested Queries */}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => `query-${item.query}`}
            scrollEnabled={false}
          />
        )}

        {/* Separator */}
        {suggestions.length > 0 && users.length > 0 && <View style={styles.separator} />}
      </>
    ),
    [suggestions, users, renderSuggestionItem, styles.separator],
  );

  return (
    <View style={styles.container}>
      <SearchInput value={query} onChangeText={setQuery} onSubmit={handleSubmit} autoFocus placeholder={placeholder} />

      {isLoading && query.length > 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.text.link} />
        </View>
      )}

      {!isLoading && query.length > 0 && (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => `user-${item.userId}`}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            suggestions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('search.noResults', 'No results found')}</Text>
              </View>
            ) : null
          }
        />
      )}

      {query.length === 0 && (
        <SearchHistoryList
          history={searchHistory}
          onItemPress={handleHistoryItemPress}
          onRemoveItem={removeFromHistory}
          onClearAll={clearHistory}
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: 100,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    emptyContainer: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
    },
  });

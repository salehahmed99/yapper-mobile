import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchHistoryItem from './SearchHistoryItem';

interface ISearchHistoryListProps {
  history: string[];
  onItemPress: (query: string) => void;
  onRemoveItem: (query: string) => void;
  onClearAll: () => void;
}

const SearchHistoryList: React.FC<ISearchHistoryListProps> = ({ history, onItemPress, onRemoveItem, onClearAll }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('search.noHistory', 'No recent searches')}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: string }) => (
    <SearchHistoryItem query={item} onPress={onItemPress} onRemove={onRemoveItem} />
  );

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('search.recentSearches', 'Recent Searches')}</Text>
      <TouchableOpacity onPress={onClearAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.clearAllText}>{t('search.clearAll', 'Clear all')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={history}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      ListHeaderComponent={ListHeader}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    clearAllText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.link,
    },
    listContent: {
      paddingBottom: 100,
    },
    emptyContainer: {
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
  });

export default SearchHistoryList;

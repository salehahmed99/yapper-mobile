import QueryWrapper from '@/src/components/QueryWrapper';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, ViewToken } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { useTweetQuotes } from '../hooks/useTweetQuotes';
import { ITweet } from '../types';

interface ITweetQuotesListProps {
  tweetId: string;
}

const TweetQuotesList: React.FC<ITweetQuotesListProps> = ({ tweetId }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { bottom } = useSpacing();
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<string>>(new Set());

  const quotesQuery = useTweetQuotes(tweetId);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = new Set(
      viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweetId),
    );
    setVisibleTweetIds(visibleIds);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
    waitForInteraction: false,
  }).current;

  const handleEndReached = () => {
    if (quotesQuery.hasNextPage && !quotesQuery.isFetchingNextPage) {
      quotesQuery.fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (quotesQuery.isFetchingNextPage) {
      return (
        <View
          style={styles.loadingFooter}
          accessible={true}
          accessibilityLabel="Loading more quotes"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      );
    }
    return <View style={{ height: bottom }} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{t('userList.emptyState')}</Text>
    </View>
  );

  return (
    <QueryWrapper query={quotesQuery}>
      {(data) => {
        const flattenedData = data.pages.flatMap((page) => page.data || []);

        return (
          <FlatList
            style={styles.list}
            data={flattenedData}
            renderItem={({ item }) => (
              <TweetContainer tweet={item} isVisible={visibleTweetIds.has(item.tweetId)} showThread={false} />
            )}
            keyExtractor={(item, index) => `${item.tweetId}-${index}`}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            scrollIndicatorInsets={{ right: 1 }}
            scrollEnabled
            accessible={true}
            accessibilityLabel="Tweet quotes list"
            accessibilityRole="list"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        );
      }}
    </QueryWrapper>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    loadingFooter: {
      paddingVertical: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
    list: {
      flex: 1,
    },
  });

export default TweetQuotesList;

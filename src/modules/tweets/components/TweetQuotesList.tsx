import QueryWrapper from '@/src/components/QueryWrapper';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { useTweetQuotes } from '../hooks/useTweetQuotes';

interface ITweetQuotesListProps {
  tweetId: string;
}

const TweetQuotesList: React.FC<ITweetQuotesListProps> = ({ tweetId }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { bottom } = useSpacing();

  const quotesQuery = useTweetQuotes(tweetId);

  const handleEndReached = () => {
    if (quotesQuery.hasNextPage && !quotesQuery.isFetchingNextPage) {
      quotesQuery.fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (quotesQuery.isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      );
    }
    return <View style={{ height: bottom }} />;
  };

  return (
    <QueryWrapper query={quotesQuery}>
      {(data) => {
        // Flatten paginated data - backend returns data as array directly
        const flattenedData = data.pages.flatMap((page) => page.data);

        return (
          <FlatList
            style={{ flex: 1 }}
            data={flattenedData}
            renderItem={({ item }) => <TweetContainer tweet={item} />}
            keyExtractor={(item, index) => `${item.tweet_id}-${index}`}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            scrollIndicatorInsets={{ right: 1 }}
            scrollEnabled
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
  });

export default TweetQuotesList;

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import TweetContainer from '@/src/modules/tweets/containers/TweetContainer';
import { ITweet } from '@/src/modules/tweets/types';
import React, { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface IProfilePostsListProps {
  data: ITweet[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
}

const TweetItem = memo(({ item, showSeparator }: { item: ITweet; showSeparator: boolean }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <TweetContainer tweet={item} />
      {showSeparator && <View style={styles.separator} />}
    </View>
  );
});

TweetItem.displayName = 'TweetItem';

const ProfilePostsList: React.FC<IProfilePostsListProps> = memo((props) => {
  const { data, isLoading, isFetchingNextPage } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderTweetItem = useCallback(
    (item: ITweet, index: number) => {
      const key =
        item.type === 'repost' ? `${item.tweetId}-${item.repostedBy?.repostId}-${index}` : `${item.tweetId}-${index}`;

      return <TweetItem key={key} item={item} showSeparator={index < data.length - 1} />;
    },
    [data.length],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="profile_posts_list_loading">
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="profile_posts_list_container">
      {data.map(renderTweetItem)}
      {isFetchingNextPage && (
        <View style={styles.loadingFooter} testID="profile_posts_list_loading_more">
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      )}
      <View style={styles.bottomSpacing} />
    </View>
  );
});

ProfilePostsList.displayName = 'ProfilePostsList';

export default ProfilePostsList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    bottomSpacing: {
      height: 100,
    },
  });

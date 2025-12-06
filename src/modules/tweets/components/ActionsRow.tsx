import BookmarkIcon from '@/src/components/icons/BookmarkIcon';
import LikeIcon from '@/src/components/icons/LikeIcon';
import ReplyIcon from '@/src/components/icons/ReplyIcon';
import RepostIcon from '@/src/components/icons/RepostIcon';
import ShareIcon from '@/src/components/icons/ShareIcon';
import ViewsIcon from '@/src/components/icons/ViewsIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ITweet } from '../types';
import TweetActionButton from './TweetActionButton';
interface IActionsRowProps {
  tweet: ITweet;
  onReplyPress: () => void;
  onRepostPress: () => void;
  onLikePress: (isLiked: boolean) => void;
  onBookmarkPress: (isBookmarked: boolean) => void;
  onSharePress: () => void;
  size: 'small' | 'large';
}
const ActionsRow: React.FC<IActionsRowProps> = (props) => {
  const { tweet, onReplyPress, onRepostPress, onLikePress, onBookmarkPress, onSharePress, size } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.actionsRow}>
      <TweetActionButton
        icon={ReplyIcon}
        count={tweet.repliesCount}
        onPress={onReplyPress}
        accessibilityLabel="tweet_button_reply"
        testID="tweet_button_reply"
        size={size}
      />
      <TweetActionButton
        icon={RepostIcon}
        count={tweet.repostsCount}
        onPress={onRepostPress}
        color={tweet.isReposted ? theme.colors.accent.repost : theme.colors.text.secondary}
        accessibilityLabel="tweet_button_repost"
        testID="tweet_button_repost"
        size={size}
      />

      <TweetActionButton
        icon={LikeIcon}
        count={tweet.likesCount}
        onPress={() => onLikePress(tweet.isLiked)}
        color={tweet.isLiked ? theme.colors.accent.like : theme.colors.text.secondary}
        filled={tweet.isLiked}
        accessibilityLabel="tweet_button_like"
        testID="tweet_button_like"
        size={size}
      />
      {size === 'small' && (
        <TweetActionButton
          icon={ViewsIcon}
          count={tweet.viewsCount}
          size={size}
          accessibilityLabel="tweet_button_views"
          testID="tweet_button_views"
        />
      )}

      <TweetActionButton
        icon={BookmarkIcon}
        count={tweet.bookmarksCount}
        onPress={() => onBookmarkPress(tweet.isBookmarked)}
        color={tweet.isBookmarked ? theme.colors.accent.bookmark : theme.colors.text.secondary}
        filled={tweet.isBookmarked}
        accessibilityLabel="tweet_button_bookmark"
        testID="tweet_button_bookmark"
        size={size}
      />
      <TweetActionButton
        icon={ShareIcon}
        onPress={onSharePress}
        accessibilityLabel="tweet_button_share"
        testID="tweet_button_share"
        size={size}
      />
    </View>
  );
};

export default ActionsRow;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
  });

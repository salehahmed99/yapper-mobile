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
  onRepostPress: (isReposted: boolean) => void;
  onLikePress: (isLiked: boolean) => void;
  onViewsPress: () => void;
  onBookmarkPress: () => void;
  isBookmarked: boolean;
  onSharePress: () => void;
  size: 'small' | 'large';
}
const ActionsRow: React.FC<IActionsRowProps> = (props) => {
  const {
    tweet,
    onReplyPress,
    onRepostPress,
    onLikePress,
    onViewsPress,
    onBookmarkPress,
    onSharePress,
    isBookmarked,
    size,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.actionsRow}>
      <TweetActionButton
        icon={ReplyIcon}
        count={tweet.repliesCount}
        onPress={onReplyPress}
        accessibilityLabel="tweet_button_reply"
        strokeColor={theme.colors.text.secondary}
        size={size}
      />
      <TweetActionButton
        icon={RepostIcon}
        count={tweet.repostsCount}
        onPress={() => onRepostPress(tweet.isReposted)}
        strokeColor={tweet.isReposted ? theme.colors.accent.repost : theme.colors.text.secondary}
        accessibilityLabel="tweet_button_repost"
        size={size}
        isRepost={true}
      />

      <TweetActionButton
        icon={LikeIcon}
        count={tweet.likesCount}
        onPress={() => onLikePress(tweet.isLiked)}
        strokeColor={tweet.isLiked ? theme.colors.accent.like : theme.colors.text.secondary}
        fillColor={tweet.isLiked ? theme.colors.accent.like : 'transparent'}
        accessibilityLabel="tweet_button_like"
        size={size}
      />
      {size === 'small' && (
        <TweetActionButton
          icon={ViewsIcon}
          count={tweet.viewsCount}
          onPress={onViewsPress}
          strokeColor={theme.colors.text.secondary}
          size={size}
          accessibilityLabel="tweet_button_views"
        />
      )}

      <TweetActionButton
        icon={BookmarkIcon}
        onPress={onBookmarkPress}
        strokeColor={isBookmarked ? theme.colors.accent.bookmark : theme.colors.text.secondary}
        fillColor={isBookmarked ? theme.colors.accent.bookmark : 'transparent'}
        accessibilityLabel="tweet_button_bookmark"
        size={size}
      />
      <TweetActionButton
        icon={ShareIcon}
        onPress={onSharePress}
        accessibilityLabel="tweet_button_share"
        size={size}
        strokeColor={theme.colors.text.secondary}
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

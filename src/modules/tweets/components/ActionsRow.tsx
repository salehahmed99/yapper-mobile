import BookmarkIcon from '@/assets/icons/bookmark.svg';
import LikeIcon from '@/assets/icons/like.svg';
import ReplyIcon from '@/assets/icons/reply.svg';
import RepostIcon from '@/assets/icons/repost.svg';
import ShareIcon from '@/assets/icons/share.svg';
import ViewsIcon from '@/assets/icons/views.svg';
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
}
const ActionsRow: React.FC<IActionsRowProps> = (props) => {
  const { tweet, onReplyPress, onRepostPress, onLikePress, onViewsPress, onBookmarkPress, onSharePress, isBookmarked } =
    props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.actionsRow}>
      <TweetActionButton
        icon={ReplyIcon}
        count={tweet.replies_count}
        onPress={onReplyPress}
        accessibilityLabel="tweet_button_reply"
      />
      <TweetActionButton
        icon={RepostIcon}
        count={tweet.reposts_count}
        onPress={() => onRepostPress(tweet.is_reposted)}
        strokeColor={tweet.is_reposted ? theme.colors.accent.repost : theme.colors.text.secondary}
        accessibilityLabel="tweet_button_repost"
      />

      <TweetActionButton
        icon={LikeIcon}
        count={tweet.likes_count}
        onPress={() => onLikePress(tweet.is_liked)}
        strokeColor={tweet.is_liked ? theme.colors.accent.like : theme.colors.text.secondary}
        fillColor={tweet.is_liked ? theme.colors.accent.like : 'transparent'}
        accessibilityLabel="tweet_button_like"
      />
      <TweetActionButton
        icon={ViewsIcon}
        count={tweet.views_count}
        onPress={onViewsPress}
        accessibilityLabel="tweet_button_views"
      />

      <TweetActionButton
        icon={BookmarkIcon}
        onPress={onBookmarkPress}
        strokeColor={isBookmarked ? theme.colors.accent.bookmark : theme.colors.text.secondary}
        fillColor={isBookmarked ? theme.colors.accent.bookmark : 'transparent'}
        accessibilityLabel="tweet_button_bookmark"
      />
      <TweetActionButton icon={ShareIcon} onPress={onSharePress} accessibilityLabel="tweet_button_share" />
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

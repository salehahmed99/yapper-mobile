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
      <TweetActionButton icon={ReplyIcon} count={tweet.repliesCount} onPress={onReplyPress} />
      <TweetActionButton
        icon={RepostIcon}
        count={tweet.repostsCount}
        onPress={() => onRepostPress(tweet.isReposted)}
        strokeColor={tweet.isReposted ? theme.colors.accent.repost : theme.colors.text.secondary}
      />

      <TweetActionButton
        icon={LikeIcon}
        count={tweet.likesCount}
        onPress={() => onLikePress(tweet.isLiked)}
        strokeColor={tweet.isLiked ? theme.colors.accent.like : theme.colors.text.secondary}
        fillColor={tweet.isLiked ? theme.colors.accent.like : 'transparent'}
      />
      <TweetActionButton icon={ViewsIcon} count={tweet.viewsCount} onPress={onViewsPress} />

      <TweetActionButton
        icon={BookmarkIcon}
        onPress={onBookmarkPress}
        strokeColor={isBookmarked ? theme.colors.accent.bookmark : theme.colors.text.secondary}
        fillColor={isBookmarked ? theme.colors.accent.bookmark : 'transparent'}
      />
      <TweetActionButton icon={ShareIcon} onPress={onSharePress} />
    </View>
  );
};

export default ActionsRow;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    repostContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      marginStart: theme.spacing.xl,
    },
    repsostText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.bold,
      fontSize: theme.typography.sizes.xs,
    },
    tweetContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    imageColumn: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    detailsColumn: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    tweetContent: {},
    avatar: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      // borderWidth:1,
      // borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    actionCount: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.xs,
    },
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    parentTweetContainer: {
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
  });

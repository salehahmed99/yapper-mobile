import DropdownMenu, { DropdownMenuItem } from '@/src/components/DropdownMenu';
import GrokLogo from '@/src/components/icons/GrokLogo';
import ViewsIcon from '@/src/components/icons/ViewsIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Image } from 'expo-image';
import { MoreHorizontal, Trash2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_AVATAR_URI } from '../../profile/utils/edit-profile.utils';
import useTweetDropDownMenu from '../hooks/useTweetDropDownMenu';
import { ITweet } from '../types';
import ActionsRow from './ActionsRow';
import ParentTweet from './ParentTweet';
import RepostIndicator from './RepostIndicator';
import TweetMedia from './TweetMedia';
import UserInfoRow from './UserInfoRow';

interface ITweetProps {
  tweet: ITweet;
  onReplyPress: () => void;
  onLike: (isLiked: boolean) => void;
  onViewPostInteractions: (tweetId: string, ownerId: string) => void;
  onBookmark: (isBookmarked: boolean) => void;
  onShare: () => void;
  onDeletePress: () => void;
  openSheet: () => void;
  isVisible?: boolean;
  onTweetPress: (tweetId: string) => void;
  onAvatarPress: (userId: string) => void;
}

const Tweet: React.FC<ITweetProps> = (props) => {
  const {
    tweet,
    onReplyPress,
    onLike,
    onViewPostInteractions,
    onBookmark,
    onShare,
    onDeletePress,
    openSheet,
    isVisible = true,
    onTweetPress,
    onAvatarPress,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);

  const { menuVisible, menuPosition, moreButtonRef, handleMorePress, setMenuVisible } = useTweetDropDownMenu();

  const menuItems: DropdownMenuItem[] = [
    {
      label: t('tweetActivity.viewPostInteractions'),
      onPress: () => {
        onViewPostInteractions(tweet.tweetId, tweet.user.id);
      },
      icon: <ViewsIcon size={theme.iconSizes.md} stroke={theme.colors.text.primary} strokeWidth={0} />,
    },
  ];

  if (tweet.user.id === user?.id) {
    menuItems.push({
      label: 'Delete post',
      onPress: onDeletePress,
      icon: <Trash2 size={theme.iconSizes.md} stroke={theme.colors.text.primary} />,
    });
  }

  return (
    <Pressable
      style={styles.container}
      accessibilityLabel="tweet_container_main"
      testID="tweet_container_main"
      onPress={() => onTweetPress(tweet.tweetId)}
    >
      {tweet.repostedBy && (
        <RepostIndicator repostById={tweet.repostedBy?.id} repostedByName={tweet.repostedBy?.name} />
      )}
      <View style={styles.tweetContainer}>
        <View style={styles.imageColumn}>
          <Pressable
            onPress={() => onAvatarPress(tweet.user.id)}
            accessibilityLabel="tweet_avatar"
            testID="tweet_avatar"
          >
            <Image
              source={tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : DEFAULT_AVATAR_URI}
              style={styles.avatar}
              accessibilityLabel="tweet_image_avatar"
              cachePolicy="memory-disk"
            />
          </Pressable>
        </View>
        <View style={styles.detailsColumn}>
          <View style={styles.topRow}>
            <UserInfoRow tweet={tweet} />
            <View style={styles.optionsRow}>
              <GrokLogo size={16} color={theme.colors.text.secondary} />
              <Pressable
                onPress={handleMorePress}
                hitSlop={8}
                ref={moreButtonRef}
                accessibilityLabel="tweet_button_more"
                testID="tweet_button_more"
              >
                <MoreHorizontal
                  size={16}
                  color={menuVisible ? theme.colors.accent.bookmark : theme.colors.text.secondary}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.tweetContent}>
            <Text style={styles.tweetText} accessibilityLabel="tweet_content_text" testID="tweet_content_text">
              {tweet.content}
            </Text>
          </View>
          <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} isVisible={isVisible} />

          {tweet.parentTweet && (
            <View style={{ marginTop: theme.spacing.xs }}>
              <ParentTweet tweet={tweet.parentTweet} isVisible={isVisible} />
            </View>
          )}

          <ActionsRow
            tweet={tweet}
            size="small"
            onReplyPress={onReplyPress}
            onRepostPress={openSheet}
            onLikePress={onLike}
            onBookmarkPress={onBookmark}
            onSharePress={onShare}
          />

          <DropdownMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            items={menuItems}
            position={menuPosition}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default Tweet;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.md,
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
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    tweetContent: {},
    avatar: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
    },
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
    },
  });

import DropdownMenu, { DropdownMenuItem } from '@/src/components/DropdownMenu';
import GrokLogo from '@/src/components/icons/GrokLogo';
import ViewsIcon from '@/src/components/icons/ViewsIcon';
import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useMargins from '@/src/hooks/useSpacing';
import { useAuthStore } from '@/src/store/useAuthStore';
import { formatDateDDMMYYYY, formatShortTime } from '@/src/utils/dateUtils';
import { formatCount } from '@/src/utils/formatCount';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, MoreHorizontal, Trash2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTweetDropDownMenu from '../hooks/useTweetDropDownMenu';
import { ITweet } from '../types';
import ActionsRow from './ActionsRow';
import ParentTweet from './ParentTweet';
import RepostIndicator from './RepostIndicator';
import TweetMedia from './TweetMedia';

interface IFullTweetProps {
  tweet: ITweet;
  onReplyPress: () => void;
  onLike: (isLiked: boolean) => void;
  onViewPostInteractions: (tweetId: string, ownerId: string) => void;
  onBookmark: (isBookmarked: boolean) => void;
  onShare: () => void;
  onDeletePress: () => void;
  openSheet: () => void;
  onAvatarPress: (userId: string) => void;
}

const FullTweet: React.FC<IFullTweetProps> = (props) => {
  const {
    tweet,
    onReplyPress,
    onLike,
    onBookmark,
    onShare,
    onDeletePress,
    openSheet,
    onAvatarPress,
    onViewPostInteractions,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { bottom } = useMargins();

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
    <View style={styles.wrapper}>
      {/* Header with BlurView */}
      <BlurView intensity={30} style={[styles.headerBlur, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
          </Pressable>

          {/* Title */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Post</Text>
          </View>

          {/* Right Actions */}
          <View style={styles.headerRightActions}>
            <Pressable style={styles.headerButton} accessibilityLabel="Grok" accessibilityRole="button">
              <GrokLogo size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
            </Pressable>
            <Pressable
              onPress={handleMorePress}
              hitSlop={8}
              ref={moreButtonRef}
              style={styles.headerButton}
              accessibilityLabel="More options"
              accessibilityRole="button"
            >
              <MoreHorizontal size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
            </Pressable>
          </View>
        </View>
      </BlurView>

      {/* Content */}
      <ScrollView
        style={[styles.container, { marginBottom: bottom, paddingTop: insets.top + theme.ui.appBarHeight }]}
        accessibilityLabel="full_tweet_container_main"
        testID="full_tweet_container_main"
      >
        {tweet.type === 'repost' && (
          <RepostIndicator repostById={tweet.repostedBy?.id} repostedByName={tweet.repostedBy?.name} />
        )}

        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <Pressable
              onPress={() => onAvatarPress(tweet.user.id)}
              accessibilityLabel="full_tweet_avatar"
              testID="full_tweet_avatar"
            >
              <Image
                source={tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : DEFAULT_AVATAR_URL}
                style={styles.avatar}
                accessibilityLabel="full_tweet_image_avatar"
              />
            </Pressable>
            <View style={styles.userDetails}>
              <Text style={styles.name} accessibilityLabel="full_tweet_user_name" testID="full_tweet_user_name">
                {tweet.user.name}
              </Text>
              <Text
                style={styles.username}
                accessibilityLabel="full_tweet_user_username"
                testID="full_tweet_user_username"
              >
                @{tweet.user.username}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.tweetText} accessibilityLabel="full_tweet_content_text" testID="full_tweet_content_text">
            {tweet.content}
          </Text>
        </View>

        {(tweet.images.length > 0 || tweet.videos.length > 0) && (
          <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} isVisible={true} />
        )}

        {tweet.parentTweet && (
          <View style={{ marginTop: theme.spacing.xs }}>
            <ParentTweet tweet={tweet.parentTweet} />
          </View>
        )}

        <View
          style={styles.timestampViewsSection}
          accessibilityLabel="full_tweet_timestamp_views"
          testID="full_tweet_timestamp_views"
        >
          <Text style={styles.timestampText} accessibilityLabel="full_tweet_time" testID="full_tweet_time">
            {formatShortTime(tweet.createdAt)}
          </Text>
          <View style={styles.dot}></View>
          <Text style={styles.timestampText} accessibilityLabel="full_tweet_date" testID="full_tweet_date">
            {formatDateDDMMYYYY(tweet.createdAt)}
          </Text>
          <View style={styles.dot}></View>
          <Text style={styles.viewsCount} accessibilityLabel="full_tweet_views_count" testID="full_tweet_views_count">
            {formatCount(tweet.viewsCount)}
            <Text style={styles.timestampText}> Views</Text>{' '}
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <ActionsRow
            tweet={tweet}
            size="large"
            onReplyPress={onReplyPress}
            onRepostPress={openSheet}
            onLikePress={onLike}
            onBookmarkPress={onBookmark}
            onSharePress={onShare}
          />
        </View>
        <DropdownMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={menuItems}
          position={menuPosition}
        />
      </ScrollView>
    </View>
  );
};

export default FullTweet;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    headerBlur: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background.primary + 'DF',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: theme.ui.appBarHeight,
      width: '100%',
    },
    headerButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontSize: 18,
      fontFamily: theme.typography.fonts.extraBold,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    container: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
    },
    userDetails: {
      gap: 2,
    },
    name: {
      fontFamily: theme.typography.fonts.bold,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.primary,
    },
    username: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    contentSection: {},
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * 1.3,
    },
    timestampViewsSection: {
      paddingTop: theme.spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dot: {
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: theme.colors.text.secondary,
    },
    timestampText: {
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
    },
    viewsCount: {
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xs,
    },
    actionsSection: {
      paddingTop: theme.spacing.lg,
    },
  });

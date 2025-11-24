import DropdownMenu, { DropdownMenuItem } from '@/src/components/DropdownMenu';
import GrokLogo from '@/src/components/icons/GrokLogo';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { MoreHorizontal } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  onBookmark: () => void;
  onShare: () => void;
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
    // onBookmark,
    onShare,
    openSheet,
    isVisible = true,
    onTweetPress,
    onAvatarPress,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 100, right: 16 });
  const moreButtonRef = useRef<View>(null);

  const handleMorePress = () => {
    moreButtonRef.current?.measure(
      (_x: number, _y: number, _width: number, height: number, _pageX: number, pageY: number) => {
        setMenuPosition({
          top: pageY + height,
          right: 16,
        });
        setMenuVisible(true);
      },
    );
  };

  const menuItems: DropdownMenuItem[] = [
    {
      label: t('tweetActivity.viewPostInteractions'),
      onPress: () => {
        onViewPostInteractions(tweet.tweetId, tweet.user.id);
      },
    },
  ];

  return (
    <Pressable
      style={styles.container}
      accessibilityLabel="tweet_container_main"
      testID="tweet_container_main"
      onPress={() => onTweetPress(tweet.tweetId)}
    >
      {tweet.type === 'repost' && (
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
              source={
                tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : require('@/assets/images/avatar-placeholder.png')
              }
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
              <View ref={moreButtonRef} collapsable={false}>
                <TouchableOpacity
                  onPress={handleMorePress}
                  hitSlop={8}
                  accessibilityLabel="tweet_button_more"
                  testID="tweet_button_more"
                >
                  <MoreHorizontal size={16} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tweetContent}>
            <Text style={styles.tweetText} accessibilityLabel="tweet_content_text" testID="tweet_content_text">
              {tweet.content}
            </Text>
          </View>
          <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} isVisible={isVisible} />

          {tweet.parentTweet && <ParentTweet tweet={tweet.parentTweet} isVisible={isVisible} />}
          <ActionsRow
            tweet={tweet}
            size="small"
            onReplyPress={onReplyPress}
            onRepostPress={openSheet}
            onLikePress={onLike}
            onBookmarkPress={() => setIsBookmarked(!isBookmarked)}
            isBookmarked={isBookmarked}
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

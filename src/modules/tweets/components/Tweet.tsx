import DropdownMenu, { DropdownMenuItem } from '@/src/components/DropdownMenu';
import GrokLogo from '@/src/components/icons/GrokLogo';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MoreHorizontal } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ITweet } from '../types';
import ActionsRow from './ActionsRow';
import ParentTweet from './ParentTweet';
import RepostIndicator from './RepostIndicator';
import UserInfoRow from './UserInfoRow';

interface ITweetProps {
  tweet: ITweet;
  parentTweet?: ITweet | null;
  onReplyPress: () => void;
  onRepostPress: (isReposted: boolean) => void;
  onLikePress: (isLiked: boolean) => void;
  onViewsPress: () => void;
  onBookmarkPress: () => void;
  onSharePress: () => void;
}

const Tweet: React.FC<ITweetProps> = (props) => {
  const { tweet, parentTweet, onReplyPress, onRepostPress, onLikePress, onViewsPress, onSharePress } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();

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
        router.push({
          pathname: '/(protected)/tweets/[tweetId]/activity',
          params: {
            tweetId: tweet.tweet_id,
            ownerId: tweet.user.id,
          },
        });
      },
    },
  ];
  return (
    <View style={styles.container} accessibilityLabel="tweet_container_main">
      {tweet.type === 'repost' && (
        <RepostIndicator repostById={tweet.reposted_by?.id} repostedByName={tweet.reposted_by?.name} />
      )}
      <View style={styles.tweetContainer}>
        <View style={styles.imageColumn}>
          <Pressable
            onPress={() => router.push({ pathname: '/(protected)/(profile)/[id]', params: { id: tweet.user.id } })}
          >
            <Image
              source={
                tweet.user.avatar_url
                  ? { uri: tweet.user.avatar_url }
                  : require('@/assets/images/avatar-placeholder.png')
              }
              style={styles.avatar}
              accessibilityLabel="tweet_image_avatar"
            />
          </Pressable>
        </View>
        <View style={styles.detailsColumn}>
          <View style={styles.topRow}>
            <UserInfoRow tweet={tweet} />
            <View style={styles.optionsRow}>
              <GrokLogo size={16} color={theme.colors.text.secondary} />
              <View ref={moreButtonRef} collapsable={false}>
                <TouchableOpacity onPress={handleMorePress} hitSlop={8}>
                  <MoreHorizontal size={16} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tweetContent}>
            <Text style={styles.tweetText}>{tweet.content}</Text>
          </View>
          {parentTweet && <ParentTweet tweet={parentTweet} />}
          <ActionsRow
            tweet={tweet}
            onReplyPress={onReplyPress}
            onRepostPress={onRepostPress}
            onLikePress={onLikePress}
            onViewsPress={onViewsPress}
            onBookmarkPress={() => setIsBookmarked(!isBookmarked)}
            isBookmarked={isBookmarked}
            onSharePress={onSharePress}
          />
        </View>
      </View>
      <DropdownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        position={menuPosition}
      />
    </View>
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
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
    },
  });

import BookmarkIcon from '@/assets/icons/bookmark.svg';
import LikeIcon from '@/assets/icons/like.svg';
import ReplyIcon from '@/assets/icons/reply.svg';
import RepostIcon from '@/assets/icons/repost.svg';
import ShareIcon from '@/assets/icons/share.svg';
import ViewsIcon from '@/assets/icons/views.svg';
import { Theme } from '@/src/constants/theme';
import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import TweetActionButton from '@/src/modules/tweets/components/TweetActionButton';
import {
  AVATAR_SIZE,
  BOTTOM_AVATAR_SIZE,
  CONTROL_BUTTON_SIZE,
  ICON_BUTTON_SIZE,
  PLAYBACK_SPEEDS,
  PROGRESS_BAR_HEIGHT,
  PROGRESS_THUMB_SIZE,
  SPEED_BUTTON_MIN_WIDTH,
  UI_ANIMATION_DURATION,
  USER_INFO_BOTTOM,
  VIDEO_CONTROLS_BOTTOM,
} from '@/src/modules/tweets/constants/mediaViewer';
import { useMediaViewerControls } from '@/src/modules/tweets/hooks/useMediaViewerControls';
import { useTweet } from '@/src/modules/tweets/hooks/useTweet';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import { MediaItem, MediaViewerContentProps } from '@/src/modules/tweets/types/mediaViewer';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaViewerModal() {
  const { theme } = useTheme();
  const { mediaData, closeMediaViewer } = useMediaViewer();

  if (!mediaData) return null;

  return <MediaViewerContent {...mediaData} onClose={closeMediaViewer} theme={theme} />;
}

function MediaViewerContent({
  tweetId,
  mediaIndex,
  images,
  videos,
  videoTime,
  onClose,
  theme,
}: MediaViewerContentProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: tweet } = useTweet(tweetId);
  const { likeMutation, repostMutation } = useTweetActions();

  const allMedia = useMemo((): MediaItem[] => {
    const items: MediaItem[] = [];

    images.forEach((url: string, idx: number) => {
      items.push({ type: 'image', url, index: idx });
    });

    videos.forEach((url: string, idx: number) => {
      items.push({ type: 'video', url, index: images.length + idx });
    });

    return items;
  }, [images, videos]);

  const [currentIndex, setCurrentIndex] = useState(mediaIndex);
  const [showUI, setShowUI] = useState(true);
  const [isLiked, setIsLiked] = useState(tweet?.is_liked ?? false);
  const [isReposted, setIsReposted] = useState(tweet?.is_reposted ?? false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet?.likes_count ?? 0);
  const [repostsCount, setRepostsCount] = useState(tweet?.reposts_count ?? 0);
  const flatListRef = useRef<FlatList>(null);
  const uiOpacity = useRef(new Animated.Value(1)).current;

  const currentMedia = allMedia[currentIndex];
  const videoSource = currentMedia?.type === 'video' ? currentMedia.url : null;
  const isVideo = currentMedia?.type === 'video';

  // Use video player controls hook
  const {
    player,
    currentTime,
    duration,
    isMuted,
    playbackSpeed,
    showSpeedMenu,
    progressBarRef,
    togglePlayPause,
    toggleMute,
    handleSpeedChange,
    setShowSpeedMenu,
    formatTime,
    handleProgressBarPress,
    onProgressBarTouchStart,
    onProgressBarTouchMove,
    onProgressBarTouchEnd,
  } = useMediaViewerControls({
    videoSource,
    isVideo,
    initialTime: currentIndex === mediaIndex ? videoTime : undefined,
    shouldAutoplay: true,
  });

  const handleClose = () => {
    if (isVideo && player && videoSource) {
      onClose(player.currentTime);
    } else {
      onClose();
    }
  };

  React.useEffect(() => {
    if (tweet) {
      setIsLiked(tweet.is_liked);
      setIsReposted(tweet.is_reposted);
      setLikesCount(tweet.likes_count);
      setRepostsCount(tweet.reposts_count);
    }
  }, [tweet]);

  const toggleUI = () => {
    const newShowUI = !showUI;
    setShowUI(newShowUI);
    Animated.timing(uiOpacity, {
      toValue: newShowUI ? 1 : 0,
      duration: UI_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const handleLikePress = () => {
    if (!tweet) return;
    likeMutation.mutate(
      { tweet_id: tweetId, is_liked: tweet.is_liked },
      {
        onSuccess: () => {
          // Invalidate individual tweet query to sync media viewer with the main tweets list
          queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId }] });
        },
      },
    );
  };

  const handleRepostPress = () => {
    if (!tweet) return;
    repostMutation.mutate(
      { tweet_id: tweetId, is_reposted: tweet.is_reposted },
      {
        onSuccess: () => {
          // Invalidate individual tweet query to sync media viewer with the main tweets list
          queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId }] });
        },
      },
    );
  };

  const handleBookmarkPress = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleUserProfilePress = () => {
    if (!tweet?.user?.id) return;
    router.push({
      pathname: '/(protected)/(profile)/[id]',
      params: { id: tweet.user.id },
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: MediaItem }) => {
    const isCurrentVideo = item.type === 'video' && item.url === videoSource && videoSource;

    return (
      <Pressable style={styles.mediaContainer} onPress={toggleUI} accessibilityRole="button">
        {item.type === 'video' && isCurrentVideo && player ? (
          <VideoView player={player} style={styles.mediaImage} nativeControls={false} contentFit="contain" />
        ) : item.type === 'video' ? (
          <View style={[styles.mediaImage, styles.videoPlaceholder]} />
        ) : (
          <Image source={{ uri: item.url }} style={styles.mediaImage} contentFit="contain" />
        )}
      </Pressable>
    );
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <Pressable style={styles.container} onPress={toggleUI} accessibilityRole="button">
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <FlatList
          ref={flatListRef}
          data={allMedia}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={mediaIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToAlignment="center"
          decelerationRate="fast"
          removeClippedSubviews={false}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
          updateCellsBatchingPeriod={50}
          disableIntervalMomentum
          snapToInterval={SCREEN_WIDTH}
          scrollEventThrottle={16}
        />

        {/* Top Bar */}
        <Animated.View style={[styles.topBar, { opacity: uiOpacity }]} pointerEvents={showUI ? 'box-none' : 'none'}>
          <SafeAreaView edges={['top']} style={styles.safeArea} pointerEvents="box-none">
            <View style={styles.topBarContent} pointerEvents="auto">
              <TouchableOpacity onPress={handleClose} style={styles.iconButton} accessibilityLabel="back_button">
                <ArrowLeft size={theme.iconSizes.lg} color="#fff" />
              </TouchableOpacity>

              {allMedia[currentIndex]?.type === 'image' && (
                <TouchableOpacity
                  style={styles.topBarCenter}
                  onPress={handleUserProfilePress}
                  accessibilityLabel="media_view_profile"
                  accessibilityRole="button"
                >
                  {tweet?.user?.avatar_url && <Image source={{ uri: tweet.user.avatar_url }} style={styles.avatar} />}
                  <View style={styles.userInfo}>
                    <Text style={styles.accountText} numberOfLines={1}>
                      {tweet?.user?.name || 'Loading...'}
                    </Text>
                    <Text style={styles.handleText} numberOfLines={1}>
                      @{tweet?.user?.username || '...'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </Animated.View>

        {allMedia[currentIndex]?.type === 'video' && (
          <Animated.View
            style={[styles.actionsBar, { opacity: uiOpacity }]}
            pointerEvents={showUI ? 'box-none' : 'none'}
          >
            <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
              <View style={styles.actionsRow} pointerEvents="auto">
                <TweetActionButton
                  icon={ReplyIcon}
                  count={tweet?.replies_count}
                  onPress={() => console.warn('Reply')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_reply"
                />
                <TweetActionButton
                  icon={RepostIcon}
                  count={repostsCount}
                  onPress={handleRepostPress}
                  strokeColor={isReposted ? theme.colors.accent.repost : '#fff'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_repost"
                />
                <TweetActionButton
                  icon={LikeIcon}
                  count={likesCount}
                  onPress={handleLikePress}
                  strokeColor={isLiked ? theme.colors.accent.like : '#fff'}
                  fillColor={isLiked ? theme.colors.accent.like : 'transparent'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_like"
                />
                <TweetActionButton
                  icon={ViewsIcon}
                  count={tweet?.views_count}
                  onPress={() => console.warn('Views')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_views"
                />
                <TweetActionButton
                  icon={BookmarkIcon}
                  onPress={handleBookmarkPress}
                  strokeColor={isBookmarked ? theme.colors.accent.bookmark : '#fff'}
                  fillColor={isBookmarked ? theme.colors.accent.bookmark : 'transparent'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_bookmark"
                />
                <TweetActionButton
                  icon={ShareIcon}
                  onPress={() => console.warn('Share')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_share"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        )}

        {allMedia[currentIndex]?.type === 'video' && (
          <Animated.View
            style={[styles.bottomUserInfo, { opacity: uiOpacity }]}
            pointerEvents={showUI ? 'box-none' : 'none'}
          >
            <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
              <View style={styles.userInfoContent} pointerEvents="auto">
                <TouchableOpacity
                  style={styles.bottomUserRow}
                  onPress={handleUserProfilePress}
                  accessibilityLabel="media_video_profile"
                  accessibilityRole="button"
                >
                  {tweet?.user?.avatar_url && (
                    <Image source={{ uri: tweet.user.avatar_url }} style={styles.bottomAvatar} />
                  )}
                  <View style={styles.bottomUserText}>
                    <View style={styles.bottomUserNames}>
                      <Text style={styles.bottomUserName} numberOfLines={1}>
                        {tweet?.user?.name || 'Loading...'}
                      </Text>
                      <Text style={styles.bottomUserHandle} numberOfLines={1}>
                        @{tweet?.user?.username || '...'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {tweet?.content && (
                  <Text style={styles.bottomTweetText} numberOfLines={2}>
                    {tweet.content}
                  </Text>
                )}
              </View>
            </SafeAreaView>
          </Animated.View>
        )}

        {allMedia[currentIndex]?.type === 'image' && (
          <Animated.View
            style={[styles.bottomBar, { opacity: uiOpacity }]}
            pointerEvents={showUI ? 'box-none' : 'none'}
          >
            <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
              <View style={styles.actionsRow} pointerEvents="auto">
                <TweetActionButton
                  icon={ReplyIcon}
                  count={tweet?.replies_count}
                  onPress={() => console.warn('Reply')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_reply"
                />
                <TweetActionButton
                  icon={RepostIcon}
                  count={repostsCount}
                  onPress={handleRepostPress}
                  strokeColor={isReposted ? theme.colors.accent.repost : '#fff'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_repost"
                />
                <TweetActionButton
                  icon={LikeIcon}
                  count={likesCount}
                  onPress={handleLikePress}
                  strokeColor={isLiked ? theme.colors.accent.like : '#fff'}
                  fillColor={isLiked ? theme.colors.accent.like : 'transparent'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_like"
                />
                <TweetActionButton
                  icon={ViewsIcon}
                  count={tweet?.views_count}
                  onPress={() => console.warn('Views')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_views"
                />
                <TweetActionButton
                  icon={BookmarkIcon}
                  onPress={handleBookmarkPress}
                  strokeColor={isBookmarked ? theme.colors.accent.bookmark : '#fff'}
                  fillColor={isBookmarked ? theme.colors.accent.bookmark : 'transparent'}
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_bookmark"
                />
                <TweetActionButton
                  icon={ShareIcon}
                  onPress={() => console.warn('Share')}
                  strokeColor="#fff"
                  size={theme.iconSizes.md}
                  accessibilityLabel="media_button_share"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        )}

        {allMedia[currentIndex]?.type === 'video' && videoSource && (
          <Animated.View
            style={[styles.videoControlsContainer, { opacity: uiOpacity }]}
            pointerEvents={showUI ? 'box-none' : 'none'}
          >
            <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
              <View style={styles.videoControls} pointerEvents="auto">
                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={styles.controlButton}
                  accessibilityLabel="video_play_pause"
                  accessibilityRole="button"
                >
                  {player?.playing ? (
                    <Pause size={theme.iconSizes.md} color="#fff" fill="#fff" />
                  ) : (
                    <Play size={theme.iconSizes.md} color="#fff" fill="#fff" />
                  )}
                </TouchableOpacity>
                <Text style={styles.timeText} accessibilityLabel="video_current_time">
                  {formatTime(currentTime)}
                </Text>
                <Pressable
                  style={styles.progressBarContainer}
                  onPress={handleProgressBarPress}
                  onTouchStart={onProgressBarTouchStart}
                  onTouchMove={onProgressBarTouchMove}
                  onTouchEnd={onProgressBarTouchEnd}
                  accessibilityLabel="video_progress_bar"
                  accessibilityRole="adjustable"
                >
                  <View ref={progressBarRef} style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }]}
                    >
                      <View style={styles.progressThumb} />
                    </View>
                  </View>
                </Pressable>
                <Text style={styles.timeText} accessibilityLabel="video_duration">
                  {formatTime(duration)}
                </Text>
                <TouchableOpacity
                  onPress={toggleMute}
                  style={styles.controlButton}
                  accessibilityLabel="video_mute_toggle"
                  accessibilityRole="button"
                >
                  {isMuted ? (
                    <VolumeX size={theme.iconSizes.md} color="#fff" />
                  ) : (
                    <Volume2 size={theme.iconSizes.md} color="#fff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                  style={styles.speedButton}
                  accessibilityLabel="video_speed_menu"
                  accessibilityRole="button"
                >
                  <Text style={styles.speedText}>{playbackSpeed}x</Text>
                </TouchableOpacity>
              </View>

              {showSpeedMenu && (
                <View style={styles.speedMenu} pointerEvents="auto">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      onPress={() => handleSpeedChange(speed)}
                      style={[styles.speedMenuItem, playbackSpeed === speed && styles.speedMenuItemActive]}
                      accessibilityLabel={`video_speed_${speed}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.speedMenuText, playbackSpeed === speed && styles.speedMenuTextActive]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        )}
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    safeArea: {
      width: '100%',
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10,
    },
    topBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    topBarCenter: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    userInfo: {
      flex: 1,
    },
    accountText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: '#fff',
    },
    handleText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    iconButton: {
      width: ICON_BUTTON_SIZE,
      height: ICON_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionsBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10,
    },
    bottomUserInfo: {
      position: 'absolute',
      bottom: USER_INFO_BOTTOM,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10,
    },
    userInfoContent: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    bottomUserRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    bottomAvatar: {
      width: BOTTOM_AVATAR_SIZE,
      height: BOTTOM_AVATAR_SIZE,
      borderRadius: BOTTOM_AVATAR_SIZE / 2,
    },
    bottomUserText: {
      flex: 1,
    },
    bottomUserNames: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    bottomUserName: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
      color: '#fff',
    },
    bottomUserHandle: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    bottomTweetText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: '#fff',
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    mediaContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    videoPlaceholder: {
      backgroundColor: '#000',
    },
    videoControlsContainer: {
      position: 'absolute',
      bottom: VIDEO_CONTROLS_BOTTOM,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10,
    },
    videoControls: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    controlButton: {
      width: CONTROL_BUTTON_SIZE,
      height: CONTROL_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    speedButton: {
      paddingHorizontal: theme.spacing.xs,
      height: CONTROL_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.sm,
      minWidth: SPEED_BUTTON_MIN_WIDTH,
    },
    speedText: {
      fontSize: theme.typography.sizes.xs,
      color: '#fff',
      fontFamily: theme.typography.fonts.medium,
    },
    timeText: {
      fontSize: theme.typography.sizes.xs,
      color: '#fff',
      fontFamily: theme.typography.fonts.regular,
      minWidth: 42,
    },
    progressBarContainer: {
      flex: 1,
      height: CONTROL_BUTTON_SIZE,
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xs,
      paddingVertical: 10,
    },
    progressBar: {
      height: PROGRESS_BAR_HEIGHT,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: PROGRESS_BAR_HEIGHT / 2,
      overflow: 'visible',
      position: 'relative',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#fff',
      borderRadius: PROGRESS_BAR_HEIGHT / 2,
      position: 'relative',
    },
    progressThumb: {
      position: 'absolute',
      right: -PROGRESS_THUMB_SIZE / 2,
      top: -(PROGRESS_THUMB_SIZE - PROGRESS_BAR_HEIGHT) / 2,
      width: PROGRESS_THUMB_SIZE,
      height: PROGRESS_THUMB_SIZE,
      borderRadius: PROGRESS_THUMB_SIZE / 2,
      backgroundColor: '#fff',
      ...theme.shadows.sm,
    },
    speedMenu: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderTopWidth: theme.borderWidth.thin,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      paddingVertical: theme.spacing.xs,
      maxHeight: 300,
    },
    speedMenuItem: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    speedMenuItemActive: {
      backgroundColor: 'rgba(29, 155, 240, 0.1)',
    },
    speedMenuText: {
      fontSize: theme.typography.sizes.sm,
      color: 'rgba(255, 255, 255, 0.7)',
      fontFamily: theme.typography.fonts.regular,
    },
    speedMenuTextActive: {
      color: '#1d9bf0',
      fontFamily: theme.typography.fonts.bold,
    },
  });

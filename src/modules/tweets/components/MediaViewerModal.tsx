import { Theme } from '@/src/constants/theme';
import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
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
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
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
  View,
  ViewToken,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EdgeInsets, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionsRow from './ActionsRow';
import CreatePostModal from './CreatePostModal';
import RepostOptionsModal from './RepostOptionsModal';

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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);
  const { navigate } = useNavigation();
  const { likeMutation, repostMutation, replyToPostMutation, quotePostMutation, bookmarkMutation } = useTweetActions();

  // Fetch tweet data from the query cache - this ensures we always have the latest state
  const { data: tweet } = useTweet(tweetId);

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
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
  const [createPostType, setCreatePostType] = useState<'tweet' | 'quote' | 'reply'>('tweet');
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasPlayingBeforeModal = useRef(false);
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

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, []),
  );

  React.useEffect(() => {
    if (!isScreenFocused && isVideo && player) {
      try {
        player.pause();
      } catch (error) {
        console.warn('Could not pause video:', error);
      }
    } else if (isScreenFocused && isVideo && player) {
      try {
        player.play();
      } catch (error) {
        console.warn('Could not play video:', error);
      }
    }
  }, [isScreenFocused, isVideo, player]);

  const toggleUI = () => {
    // Dismiss bottom sheet if it's open
    bottomSheetModalRef.current?.dismiss();

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
    likeMutation.mutate({ tweetId, isLiked: tweet.isLiked });
  };

  const handleRepostPress = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleRepost = () => {
    if (!tweet) return;
    repostMutation.mutate({ tweetId, isReposted: tweet.isReposted });
  };

  const handleQuotePress = () => {
    wasPlayingBeforeModal.current = player?.playing ?? false;
    player?.pause();
    setCreatePostType('quote');
    setIsCreatePostModalVisible(true);
  };

  const handleQuote = (tweetId: string, content: string, mediaUris?: string[]) => {
    quotePostMutation.mutate({ tweetId, content, mediaUris });
  };

  const handleReplyPress = () => {
    wasPlayingBeforeModal.current = player?.playing ?? false;
    player?.pause();
    setCreatePostType('reply');
    setIsCreatePostModalVisible(true);
  };

  const handleCloseCreatePostModal = () => {
    setIsCreatePostModalVisible(false);
    if (wasPlayingBeforeModal.current && isVideo) {
      player?.play();
    }
    wasPlayingBeforeModal.current = false;
  };

  const handleReply = (tweetId: string, content: string, mediaUris?: string[]) => {
    replyToPostMutation.mutate({ tweetId, content, mediaUris });
  };

  const handleBookmarkPress = () => {
    if (!tweet) return;
    bookmarkMutation.mutate({ tweetId, isBookmarked: tweet.isBookmarked });
  };

  const handleUserProfilePress = () => {
    if (!tweet?.user?.id) return;
    navigate({
      pathname: '/(protected)/(profile)/[id]',
      params: { id: tweet.user.id },
    });
  };

  const handleViewInteractionsPress = () => {
    if (!tweet?.user?.id) return;
    player?.pause();
    navigate({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: tweetId,
        ownerId: tweet.user.id,
      },
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
          <Image source={{ uri: item.url }} style={styles.mediaImage} contentFit="contain" cachePolicy="memory-disk" />
        )}
      </Pressable>
    );
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.gestureRoot}>
        <BottomSheetModalProvider>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Pressable style={styles.containerPressable} onPress={toggleUI} accessibilityRole="button">
              <StatusBar barStyle="light-content" backgroundColor={theme.colors.modal.background} />

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
              <Animated.View
                style={[styles.topBar, { opacity: uiOpacity }]}
                pointerEvents={showUI ? 'box-none' : 'none'}
              >
                <SafeAreaView edges={['top']} style={styles.safeArea} pointerEvents="box-none">
                  <View style={styles.topBarContent} pointerEvents="auto">
                    <Pressable onPress={handleClose} style={styles.iconButton} accessibilityLabel="back_button">
                      <ArrowLeft size={theme.iconSizes.lg} color={theme.colors.modal.iconColor} />
                    </Pressable>

                    {!isVideo && (
                      <Pressable
                        style={styles.topBarCenter}
                        onPress={handleUserProfilePress}
                        accessibilityLabel="media_view_profile"
                        accessibilityRole="button"
                      >
                        {tweet?.user?.avatarUrl && (
                          <Image
                            source={{ uri: tweet.user.avatarUrl }}
                            style={styles.avatar}
                            cachePolicy="memory-disk"
                          />
                        )}
                        <View style={styles.userInfo}>
                          <Text style={styles.accountText} numberOfLines={1}>
                            {tweet?.user?.name || 'Loading...'}
                          </Text>
                          <Text style={styles.handleText} numberOfLines={1}>
                            @{tweet?.user?.username || '...'}
                          </Text>
                        </View>
                      </Pressable>
                    )}
                  </View>
                </SafeAreaView>
              </Animated.View>

              {/* Actions Row - shown for both video and image */}
              <Animated.View
                style={[isVideo ? styles.actionsBar : styles.bottomBar, { opacity: uiOpacity }]}
                pointerEvents={showUI ? 'box-none' : 'none'}
              >
                <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
                  {tweet && (
                    <ActionsRow
                      tweet={tweet}
                      size="modal"
                      onReplyPress={handleReplyPress}
                      onRepostPress={handleRepostPress}
                      onLikePress={handleLikePress}
                      onBookmarkPress={handleBookmarkPress}
                      onSharePress={() => console.warn('Share')}
                      hideViews
                    />
                  )}
                </SafeAreaView>
              </Animated.View>

              {/* User info for video - shown below actions */}
              {isVideo && (
                <Animated.View
                  style={[styles.bottomUserInfo, { opacity: uiOpacity }]}
                  pointerEvents={showUI ? 'box-none' : 'none'}
                >
                  <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
                    <View style={styles.userInfoContent} pointerEvents="auto">
                      <Pressable
                        style={styles.bottomUserRow}
                        onPress={handleUserProfilePress}
                        accessibilityLabel="media_video_profile"
                        accessibilityRole="button"
                      >
                        {tweet?.user?.avatarUrl && (
                          <Image
                            source={{ uri: tweet.user.avatarUrl }}
                            style={styles.bottomAvatar}
                            cachePolicy="memory-disk"
                          />
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
                      </Pressable>
                      {tweet?.content && (
                        <Text style={styles.bottomTweetText} numberOfLines={2}>
                          {tweet.content}
                        </Text>
                      )}
                    </View>
                  </SafeAreaView>
                </Animated.View>
              )}

              {/* Video controls */}
              {isVideo && videoSource && (
                <Animated.View
                  style={[styles.videoControlsContainer, { opacity: uiOpacity }]}
                  pointerEvents={showUI ? 'box-none' : 'none'}
                >
                  <SafeAreaView edges={['bottom']} style={styles.safeArea} pointerEvents="box-none">
                    <View style={styles.videoControls} pointerEvents="auto">
                      <Pressable
                        onPress={togglePlayPause}
                        style={styles.controlButton}
                        accessibilityLabel="video_play_pause"
                        accessibilityRole="button"
                      >
                        {player?.playing ? (
                          <Pause
                            size={theme.iconSizes.md}
                            color={theme.colors.modal.iconColor}
                            fill={theme.colors.modal.iconColor}
                          />
                        ) : (
                          <Play
                            size={theme.iconSizes.md}
                            color={theme.colors.modal.iconColor}
                            fill={theme.colors.modal.iconColor}
                          />
                        )}
                      </Pressable>
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
                            style={[
                              styles.progressFill,
                              { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` },
                            ]}
                          >
                            <View style={styles.progressThumb} />
                          </View>
                        </View>
                      </Pressable>
                      <Text style={styles.timeText} accessibilityLabel="video_duration">
                        {duration > 0 ? formatTime(duration) : '--:--'}
                      </Text>
                      <Pressable
                        onPress={toggleMute}
                        style={styles.controlButton}
                        accessibilityLabel="video_mute_toggle"
                        accessibilityRole="button"
                      >
                        {isMuted ? (
                          <VolumeX size={theme.iconSizes.md} color={theme.colors.modal.iconColor} />
                        ) : (
                          <Volume2 size={theme.iconSizes.md} color={theme.colors.modal.iconColor} />
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                        style={styles.speedButton}
                        accessibilityLabel="video_speed_menu"
                        accessibilityRole="button"
                      >
                        <Text style={styles.speedText}>{playbackSpeed}x</Text>
                      </Pressable>
                    </View>

                    {showSpeedMenu && (
                      <View style={styles.speedMenu} pointerEvents="auto">
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <Pressable
                            key={String(speed)}
                            onPress={() => handleSpeedChange(speed as any)}
                            style={[styles.speedMenuItem, playbackSpeed === speed && styles.speedMenuItemActive]}
                            accessibilityLabel={`video_speed_${speed}`}
                            accessibilityRole="button"
                          >
                            <Text style={[styles.speedMenuText, playbackSpeed === speed && styles.speedMenuTextActive]}>
                              {speed}x
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </SafeAreaView>
                </Animated.View>
              )}
            </Pressable>
          </SafeAreaView>

          <RepostOptionsModal
            isReposted={tweet?.isReposted ?? false}
            onRepostPress={handleRepost}
            onQuotePress={handleQuotePress}
            onViewInteractionsPress={handleViewInteractionsPress}
            bottomSheetModalRef={bottomSheetModalRef}
          />

          <CreatePostModal
            visible={isCreatePostModalVisible}
            onClose={handleCloseCreatePostModal}
            type={createPostType}
            tweet={tweet || undefined}
            onPostReply={handleReply}
            onPostQuote={handleQuote}
          />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (theme: Theme, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.modal.background,
    },
    containerPressable: {
      flex: 1,
    },
    safeArea: {
      width: '100%',
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.modal.overlay,
      zIndex: 10,
      paddingTop: insets.top,
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
      color: theme.colors.modal.textPrimary,
    },
    handleText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.modal.textSecondary,
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
      backgroundColor: theme.colors.modal.overlay,
      zIndex: 10,
      paddingBottom: insets.bottom,
    },
    bottomUserInfo: {
      position: 'absolute',
      bottom: USER_INFO_BOTTOM + insets.bottom,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.modal.overlay,
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
      color: theme.colors.modal.textPrimary,
    },
    bottomUserHandle: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.modal.textTertiary,
    },
    bottomTweetText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.modal.textPrimary,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.modal.overlay,
      zIndex: 10,
      paddingBottom: insets.bottom,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionCount: {
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
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
      backgroundColor: theme.colors.modal.background,
    },
    videoControlsContainer: {
      position: 'absolute',
      bottom: VIDEO_CONTROLS_BOTTOM + insets.bottom,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.modal.overlay,
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
      backgroundColor: theme.colors.modal.buttonBackground,
      borderRadius: theme.borderRadius.sm,
      minWidth: SPEED_BUTTON_MIN_WIDTH,
    },
    speedText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.modal.textPrimary,
      fontFamily: theme.typography.fonts.medium,
    },
    timeText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.modal.textPrimary,
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
      backgroundColor: theme.colors.modal.textPrimary,
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
      backgroundColor: theme.colors.modal.textPrimary,
      ...theme.shadows.sm,
    },
    speedMenu: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderTopWidth: theme.borderWidth.thin,
      borderTopColor: theme.colors.modal.buttonBackground,
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
      backgroundColor: theme.colors.modal.buttonActiveBackground,
    },
    speedMenuText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.modal.textSecondary,
      fontFamily: theme.typography.fonts.regular,
    },
    speedMenuTextActive: {
      color: theme.colors.modal.buttonActiveColor,
      fontFamily: theme.typography.fonts.bold,
    },
    gestureRoot: {
      flex: 1,
    },
  });

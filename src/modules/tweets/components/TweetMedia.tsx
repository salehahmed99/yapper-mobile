import { Theme } from '@/src/constants/theme';
import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Volume2, VolumeX } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MAX_MEDIA_ITEMS = 4;

interface ITweetMediaProps {
  images: string[];
  videos: string[];
  tweetId: string;
  isVisible?: boolean;
}

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  index: number;
};

const TweetMedia: React.FC<ITweetMediaProps> = ({ images, videos, tweetId, isVisible = false }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { openMediaViewer, isOpen: isMediaViewerOpen, lastClosedData } = useMediaViewer();
  // const { openMediaViewer, lastClosedData } = useMediaViewer();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  // Track if component should render videos - only create players when visible
  const [shouldRenderVideos, setShouldRenderVideos] = useState(isVisible);

  const allMedia = useMemo<MediaItem[]>(() => {
    const mediaItems: MediaItem[] = [];

    images.forEach((url, idx) => {
      mediaItems.push({ type: 'image', url, index: idx });
    });

    videos.forEach((url, idx) => {
      mediaItems.push({ type: 'video', url, index: images.length + idx });
    });

    return mediaItems.slice(0, MAX_MEDIA_ITEMS);
  }, [images, videos]);

  const videoUrls = useMemo(
    () =>
      allMedia
        .filter((item) => item.type === 'video')
        .slice(0, MAX_MEDIA_ITEMS)
        .map((item) => ({ url: item.url, index: item.index })),
    [allMedia],
  );

  // Only create video players if visible and have videos
  const hasVideos = shouldRenderVideos && videoUrls.length > 0;

  const player0 = useVideoPlayer(hasVideos && videoUrls[0] ? videoUrls[0].url : '', (player) => {
    if (hasVideos && videoUrls[0]) {
      player.loop = true;
      player.muted = isMuted;
    }
  });

  const player1 = useVideoPlayer(hasVideos && videoUrls[1] ? videoUrls[1].url : '', (player) => {
    if (hasVideos && videoUrls[1]) {
      player.loop = true;
      player.muted = isMuted;
    }
  });

  const player2 = useVideoPlayer(hasVideos && videoUrls[2] ? videoUrls[2].url : '', (player) => {
    if (hasVideos && videoUrls[2]) {
      player.loop = true;
      player.muted = isMuted;
    }
  });

  const player3 = useVideoPlayer(hasVideos && videoUrls[3] ? videoUrls[3].url : '', (player) => {
    if (hasVideos && videoUrls[3]) {
      player.loop = true;
      player.muted = isMuted;
    }
  });

  const videoPlayers = useMemo(() => {
    const players: Record<number, ReturnType<typeof useVideoPlayer>> = {};
    if (videoUrls[0]) players[videoUrls[0].index] = player0;
    if (videoUrls[1]) players[videoUrls[1].index] = player1;
    if (videoUrls[2]) players[videoUrls[2].index] = player2;
    if (videoUrls[3]) players[videoUrls[3].index] = player3;
    return players;
  }, [videoUrls, player0, player1, player2, player3]);

  // Update shouldRenderVideos based on isVisible
  useEffect(() => {
    if (isVisible) {
      setShouldRenderVideos(true);
    } else {
      // Pause all videos before hiding
      Object.values(videoPlayers).forEach((player) => {
        try {
          player?.pause();
        } catch {
          // Ignore
        }
      });
      // Don't unmount videos immediately - wait to avoid rapid mount/unmount
      const timer = setTimeout(() => setShouldRenderVideos(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, videoPlayers]);

  useEffect(() => {
    Object.values(videoPlayers).forEach((player) => {
      if (player) {
        player.muted = isMuted;
      }
    });
  }, [isMuted, videoPlayers]);

  useEffect(() => {
    if (lastClosedData?.tweetId === tweetId && videoUrls.length > 0) {
      const mediaItem = allMedia[lastClosedData.mediaIndex];
      if (mediaItem?.type === 'video' && lastClosedData.videoTime !== undefined) {
        const player = videoPlayers[mediaItem.index];
        if (player) {
          try {
            player.currentTime = lastClosedData.videoTime;
          } catch {
            // Ignore errors from released players
          }
        }
      }
    }
  }, [lastClosedData, tweetId, videoUrls, videoPlayers, allMedia]);

  // Control video playback based on visibility
  useEffect(() => {
    const shouldPlayVideo = isVisible && videoUrls.length > 0 && !isMediaViewerOpen;

    if (shouldPlayVideo) {
      const firstVideoIndex = videoUrls[0].index;
      const firstPlayer = videoPlayers[firstVideoIndex];
      if (firstPlayer) {
        try {
          firstPlayer.play();
        } catch {
          // Ignore errors from released players
        }
      }

      videoUrls.slice(1).forEach((video) => {
        try {
          videoPlayers[video.index]?.pause();
        } catch {
          // Ignore errors from released players
        }
      });
    } else {
      // Always pause all videos when not visible
      Object.values(videoPlayers).forEach((player) => {
        try {
          player?.pause();
        } catch {
          // Ignore errors from released players
        }
      });
    }
  }, [isVisible, isMediaViewerOpen, videoUrls, videoPlayers]);

  const handleMutePress = (e: React.BaseSyntheticEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  // const handleVideoPress = useCallback(
  //   (index: number) => {
  //     Object.entries(videoPlayers).forEach(([idx, player]) => {
  //       const videoIdx = parseInt(idx, 10);
  //       try {
  //         if (videoIdx === index) {
  //           player.play();
  //         } else {
  //           player.pause();
  //         }
  //       } catch {
  //         // Ignore errors from released players
  //       }
  //     });
  //   },
  //   [videoPlayers],
  // );

  const handleMediaPress = useCallback(
    (index: number, mediaItem: MediaItem) => {
      let videoTime = 0;

      if (mediaItem.type === 'video') {
        const player = videoPlayers[mediaItem.index];
        if (player) {
          try {
            videoTime = player.currentTime || 0;
          } catch {
            // Ignore errors from released players
          }
        }
      }

      Object.values(videoPlayers).forEach((player) => {
        try {
          player?.pause();
        } catch {
          // Ignore errors from released players
        }
      });

      openMediaViewer({
        tweetId,
        mediaIndex: index,
        images,
        videos,
        videoTime,
      });
    },
    [videoPlayers, openMediaViewer, tweetId, images, videos],
  );

  if (allMedia.length === 0) {
    return null;
  }

  const renderMediaItem = (item: MediaItem, position: number) => {
    const isVideo = item.type === 'video';
    const remainingCount = allMedia.length - MAX_MEDIA_ITEMS;
    const showOverlay = position === 3 && remainingCount > 0;
    const player = isVideo ? videoPlayers[item.index] : null;

    const handlePress = () => {
      // Always open the media viewer on tap (images and videos)
      handleMediaPress(position, item);
    };

    const itemStyle = [
      styles.mediaItem,
      allMedia.length === 1 && styles.singleMedia,
      allMedia.length === 2 && styles.twoMedia,
      allMedia.length === 3 && position === 0 && styles.threeMediaFirst,
      allMedia.length === 3 && position > 0 && styles.threeMediaRest,
      allMedia.length === 4 && styles.fourMedia,
    ];

    return (
      <Pressable
        key={`${item.type}-${item.index}`}
        style={itemStyle}
        onPress={handlePress}
        accessibilityLabel={`media_${item.type}_${position}`}
        accessibilityRole="button"
      >
        {isVideo && player && shouldRenderVideos ? (
          <>
            <VideoView style={styles.image} player={player} nativeControls={false} contentFit="cover" />
            <TouchableOpacity
              style={styles.muteButton}
              onPress={handleMutePress}
              activeOpacity={0.7}
              accessibilityLabel="video_mute_toggle"
              accessibilityRole="button"
            >
              {isMuted ? (
                <VolumeX size={theme.iconSizes.sm} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <Volume2 size={theme.iconSizes.sm} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Image source={{ uri: item.url }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
        )}

        {showOverlay && (
          <View style={styles.countOverlay} accessibilityLabel={`media_remaining_count_${remainingCount}`}>
            <Text style={styles.countText}>+{remainingCount}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        allMedia.length === 1 && styles.containerSingle,
        allMedia.length === 2 && styles.containerTwo,
        allMedia.length >= 3 && styles.containerMultiple,
      ]}
    >
      {allMedia.map((item, idx) => renderMediaItem(item, idx))}
    </View>
  );
};

export default TweetMedia;

const MEDIA_GAP = 2;
const SINGLE_MEDIA_MAX_HEIGHT = 400;
const MULTIPLE_MEDIA_HEIGHT = 280;
const MUTE_BUTTON_SIZE = 32;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.secondary,
    },
    containerSingle: {
      maxHeight: SINGLE_MEDIA_MAX_HEIGHT,
    },
    containerTwo: {
      flexDirection: 'row',
      gap: MEDIA_GAP,
      height: MULTIPLE_MEDIA_HEIGHT,
    },
    containerMultiple: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: MEDIA_GAP,
      height: MULTIPLE_MEDIA_HEIGHT,
    },
    mediaItem: {
      position: 'relative',
      backgroundColor: theme.colors.background.tertiary,
    },
    singleMedia: {
      width: '100%',
      height: '100%',
    },
    twoMedia: {
      flex: 1,
      height: '100%',
    },
    threeMediaFirst: {
      width: '100%',
      height: '50%',
    },
    threeMediaRest: {
      width: '49.5%',
      height: '49.5%',
    },
    fourMedia: {
      width: '49.5%',
      height: '49.5%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    countOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlayDark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: theme.typography.sizes.xxl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.inverse,
    },
    muteButton: {
      position: 'absolute',
      bottom: theme.spacing.md,
      right: theme.spacing.md,
      width: MUTE_BUTTON_SIZE,
      height: MUTE_BUTTON_SIZE,
      borderRadius: MUTE_BUTTON_SIZE / 2,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
  });

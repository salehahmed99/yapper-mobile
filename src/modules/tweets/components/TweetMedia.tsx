import { Theme } from '@/src/constants/theme';
import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MAX_MEDIA_ITEMS = 4;

interface ITweetMediaProps {
  images: string[];
  videos: string[];
  tweetId: string;
}

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  index: number;
};

const TweetMedia: React.FC<ITweetMediaProps> = ({ images, videos, tweetId }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { openMediaViewer } = useMediaViewer();

  const prefetchedMediaRef = React.useRef<Set<string>>(new Set());
  useEffect(() => {
    [...images, ...videos].forEach((url) => {
      if (!prefetchedMediaRef.current.has(url)) {
        Image.prefetch(url);
        prefetchedMediaRef.current.add(url);
      }
    });
  }, [images, videos]);

  const allMedia = useMemo<MediaItem[]>(() => {
    const mediaItems: MediaItem[] = [];

    if (images) {
      images.forEach((url, idx) => {
        mediaItems.push({ type: 'image', url, index: idx });
      });
    }

    if (videos) {
      videos.forEach((url, idx) => {
        mediaItems.push({ type: 'video', url, index: (images?.length || 0) + idx });
      });
    }

    return mediaItems.slice(0, MAX_MEDIA_ITEMS);
  }, [images, videos]);

  const handleMediaPress = useCallback(
    (index: number) => {
      openMediaViewer({
        tweetId,
        mediaIndex: index,
        images,
        videos,
        videoTime: 0,
      });
    },
    [openMediaViewer, tweetId, images, videos],
  );

  if (allMedia.length === 0) {
    return null;
  }

  const renderMediaItem = (item: MediaItem, position: number) => {
    const isVideo = item.type === 'video';
    const totalMediaCount = images.length + videos.length;
    const remainingCount = totalMediaCount - MAX_MEDIA_ITEMS;
    const showOverlay = position === 3 && remainingCount > 0;

    const handlePress = () => {
      handleMediaPress(position);
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
        {/* Show image for both images and video thumbnails */}
        <Image source={{ uri: item.url }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />

        {/* Play icon overlay for videos */}
        {isVideo && (
          <View style={styles.playIconContainer} accessibilityLabel={`play_icon_${position}`}>
            <View style={styles.playIconCircle}>
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </View>
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
const PLAY_ICON_SIZE = 50;

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
    playIconContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIconCircle: {
      width: PLAY_ICON_SIZE,
      height: PLAY_ICON_SIZE,
      borderRadius: PLAY_ICON_SIZE / 2,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 4, // Slight offset to center the play icon visually
    },
  });

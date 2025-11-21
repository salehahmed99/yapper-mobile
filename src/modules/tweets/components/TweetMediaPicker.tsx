import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { Play, X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MediaAsset } from '../utils/tweetMediaPicker.utils';

interface TweetMediaPickerProps {
  media: MediaAsset[];
  onRemoveMedia: (index: number) => void;
}

export default function TweetMediaPicker({ media, onRemoveMedia }: TweetMediaPickerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (media.length === 0) return null;

  const renderMediaItem = ({ item, index }: { item: MediaAsset; index: number }) => {
    const isVideo = item.type === 'video';

    return (
      <View style={styles.mediaItemContainer}>
        {/* Media Thumbnail */}
        <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} contentFit="cover" />

        {/* Video Badge */}
        {isVideo && (
          <View style={styles.videoBadge}>
            <Play size={16} color="#fff" fill="#fff" />
          </View>
        )}

        {/* Remove Button */}
        <Pressable
          style={styles.removeButton}
          onPress={() => onRemoveMedia(index)}
          accessibilityLabel={`remove_media_${index}`}
          accessibilityRole="button"
        >
          <X size={20} color="#fff" strokeWidth={2} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderMediaItem}
        keyExtractor={(_, index) => `media-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={media.length > 2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderTopWidth: theme.borderWidth.thin,
      borderTopColor: theme.colors.border,
    },
    listContent: {
      gap: theme.spacing.sm,
    },
    mediaItemContainer: {
      position: 'relative',
      width: theme.sizes.avatar.lg,
      height: theme.sizes.avatar.lg,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.tertiary,
    },
    mediaThumbnail: {
      width: '100%',
      height: '100%',
    },
    videoBadge: {
      position: 'absolute',
      bottom: theme.spacing.xs,
      left: theme.spacing.xs,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

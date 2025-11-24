import GifIcon from '@/src/components/icons/GifIcon';
import GrokLogo from '@/src/components/icons/GrokLogo';
import PollIcon from '@/src/components/icons/PollIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Camera, ImageIcon, MapPin, Plus } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface ICircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}
const CircularProgress: React.FC<ICircularProgressProps> = (props) => {
  const { progress, size, strokeWidth, color } = props;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const { theme } = useTheme();
  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.colors.border}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

interface IBottomToolBarProps {
  remainingCharacters: number;
  progressPercentage: number;
  onGalleryPress?: () => void;
  onCameraPress?: () => void;
  mediaCount?: number;
}
const BottomToolBar: React.FC<IBottomToolBarProps> = (props) => {
  const { remainingCharacters, progressPercentage, onGalleryPress, onCameraPress, mediaCount = 0 } = props;

  const getProgressColor = () => {
    if (remainingCharacters <= 0) return theme.colors.error;
    if (remainingCharacters <= 20) return theme.colors.warning;
    return theme.colors.accent.bookmark;
  };

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const scale = useSharedValue(1);

  const previousRemainingCharacters = useRef<number>(remainingCharacters);

  useEffect(() => {
    if (remainingCharacters <= 20 && previousRemainingCharacters.current > 20) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      scale.value = withSpring(1.5);
    }
    if (remainingCharacters <= 0 && previousRemainingCharacters.current > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    if (remainingCharacters > 20 && previousRemainingCharacters.current <= 20) {
      scale.value = withSpring(1);
    }
    previousRemainingCharacters.current = remainingCharacters;
  }, [remainingCharacters]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.iconsScrollView}
        contentContainerStyle={styles.leftContainer}
        keyboardShouldPersistTaps="always"
      >
        <Pressable
          onPress={onGalleryPress}
          disabled={mediaCount >= 4}
          testID="create_post_button_gallery"
          accessibilityLabel="create_post_button_gallery"
        >
          <ImageIcon
            size={theme.iconSizesAlt.xl}
            color={mediaCount >= 4 ? theme.colors.text.secondary : theme.colors.accent.bookmark}
            strokeWidth={2}
          />
        </Pressable>
        <Pressable
          onPress={onCameraPress}
          disabled={mediaCount >= 4}
          testID="create_post_button_camera"
          accessibilityLabel="create_post_button_camera"
        >
          <Camera
            size={theme.iconSizesAlt.xl}
            color={mediaCount >= 4 ? theme.colors.text.secondary : theme.colors.accent.bookmark}
            strokeWidth={2}
          />
        </Pressable>
        <Pressable testID="create_post_button_grok" accessibilityLabel="create_post_button_grok">
          <GrokLogo size={theme.iconSizesAlt.xl} color={theme.colors.accent.bookmark} />
        </Pressable>
        <Pressable testID="create_post_button_gif" accessibilityLabel="create_post_button_gif">
          <GifIcon size={theme.iconSizesAlt.xl} stroke={theme.colors.accent.bookmark} strokeWidth={0} />
        </Pressable>
        <Pressable testID="create_post_button_emoji" accessibilityLabel="create_post_button_emoji">
          <GifIcon size={theme.iconSizesAlt.xl} stroke={theme.colors.accent.bookmark} strokeWidth={0} />
        </Pressable>
        <Pressable testID="create_post_button_poll" accessibilityLabel="create_post_button_poll">
          <PollIcon size={theme.iconSizesAlt.xl} stroke={theme.colors.accent.bookmark} strokeWidth={0} />
        </Pressable>
        <Pressable testID="create_post_button_location" accessibilityLabel="create_post_button_location">
          <MapPin size={theme.iconSizesAlt.xl} color={theme.colors.accent.bookmark} />
        </Pressable>
      </ScrollView>

      <View style={styles.rightContainer}>
        <Animated.View style={[styles.progressContainer, animatedStyle]}>
          <CircularProgress
            progress={progressPercentage > 100 ? 100 : progressPercentage}
            size={18}
            strokeWidth={remainingCharacters <= 20 ? 1.5 : 2}
            color={getProgressColor()}
          />
          {remainingCharacters <= 20 && (
            <Text style={[styles.characterCountText, remainingCharacters <= 0 && styles.characterCountNegative]}>
              {remainingCharacters}
            </Text>
          )}
        </Animated.View>

        <View style={styles.divider} />
        <Pressable style={styles.addButton} testID="create_post_button_add" accessibilityLabel="create_post_button_add">
          <Plus size={theme.iconSizesAlt.xs} color={theme.colors.black} strokeWidth={3.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default BottomToolBar;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      borderTopWidth: theme.borderWidth.tiny,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.xxll,
    },
    iconsScrollView: {
      width: '80%',
    },
    leftContainer: {
      gap: theme.spacing.xxl,
      // borderWidth: 1,
      // borderColor: 'red',
      paddingVertical: theme.spacing.md,
      paddingEnd: theme.spacing.md,
    },
    rightContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '20%',
      gap: theme.spacing.md,
    },
    progressContainer: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      width: 25,
      height: 25,
    },
    divider: {
      width: 0.5,
      height: 24,
      backgroundColor: theme.colors.border,
    },
    addButton: {
      width: theme.iconSizesAlt.lg,
      height: theme.iconSizesAlt.lg,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.accent.bookmark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    characterCountText: {
      position: 'absolute',
      fontSize: theme.typography.sizes.xxs,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.regular,
    },
    characterCountNegative: {
      color: theme.colors.error,
    },
  });

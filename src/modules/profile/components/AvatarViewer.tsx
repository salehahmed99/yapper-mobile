import { colors } from '@/src/constants/theme';
import { XIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Modal, PanResponder, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import ImageViewerStyle from '../styles/image-viewer-style';
import {
  animateClose,
  animateOpen,
  calculateOpeningAnimation,
  handleSwipeProgress,
  handleSwipeRelease,
  resetAnimationValues,
} from '../utils/avatar-viewer.utils';

type Origin = { x: number; y: number; width: number; height: number } | null;

type IAvatarViewerProps = {
  visible: boolean;
  imageUri: string;
  origin: Origin;
  isBanner?: boolean;
  onClose: () => void;
  onEditRequested?: () => void;
};

export default function AvatarViewer({
  visible,
  imageUri,
  origin,
  isBanner,
  onClose,
  onEditRequested,
}: IAvatarViewerProps) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && origin) {
      const initialValues = calculateOpeningAnimation(origin, isBanner || false);
      animateOpen(translateX, translateY, scale, fadeAnim, initialValues);
    } else if (!visible) {
      resetAnimationValues(translateX, translateY, scale, fadeAnim);
    }
  }, [visible, origin, fadeAnim, translateX, translateY, scale, isBanner]);

  const handleClose = () => {
    animateClose(fadeAnim, translateY, onClose);
  };

  const handleEdit = () => {
    handleClose();
    setTimeout(() => {
      if (onEditRequested) onEditRequested();
    }, 200);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        handleSwipeProgress(translateY, fadeAnim, gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        handleSwipeRelease(translateY, fadeAnim, gestureState.dy, gestureState.vy, handleClose);
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID="avatar_viewer_modal"
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background.primary} />
      <Animated.View style={[ImageViewerStyle.container, { opacity: fadeAnim }]}>
        {/* Backdrop */}
        <View style={ImageViewerStyle.backdrop} />

        {/* Image Container with Gestures */}
        <View style={ImageViewerStyle.imageContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              ImageViewerStyle.imageWrapper,
              {
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={[ImageViewerStyle.image, isBanner ? ImageViewerStyle.bannerImage : ImageViewerStyle.avatarImage]}
              resizeMode="contain"
              testID="avatar_viewer_image"
            />
          </Animated.View>
        </View>

        {/* Top Bar with Close Button */}
        <View style={ImageViewerStyle.topBar}>
          <TouchableOpacity
            onPress={handleClose}
            style={ImageViewerStyle.closeButton}
            activeOpacity={0.8}
            testID="avatar_viewer_close_button"
          >
            <XIcon color="#fff" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Bottom Bar with Edit Button */}
        {onEditRequested && (
          <View style={ImageViewerStyle.bottomBar}>
            <TouchableOpacity
              onPress={handleEdit}
              style={ImageViewerStyle.editButton}
              activeOpacity={0.8}
              testID="avatar_viewer_edit_button"
            >
              <Text style={ImageViewerStyle.editButtonText}>{t('profile.actions.edit')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

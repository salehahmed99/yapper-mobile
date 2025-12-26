import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, I18nManager, PanResponder, PanResponderGestureState, useWindowDimensions } from 'react-native';
import i18n from '../i18n';

export const useSwipableTabs = () => {
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const { width: screenWidth } = useWindowDimensions();

  // Animation value for tab sliding (0 = For You visible, -screenWidth = Following visible)
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [homeIndex, setHomeIndex] = useState(0);
  const homeIndexRef = useRef(homeIndex);
  useEffect(() => {
    homeIndexRef.current = homeIndex;
  }, [homeIndex]);

  // Animate to the selected tab when index changes (e.g., from tab bar tap)
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: homeIndex === 0 ? 0 : -screenWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [homeIndex, slideAnim, screenWidth]);

  // Track touch start position for tab swipe
  const tabTouchStartXRef = useRef<number | null>(null);
  const drawerEdgeThreshold = screenWidth * 0.2; // 20% of screen for drawer

  // Use refs to avoid stale closures in PanResponder (same pattern as AppShell)
  const isRTLRef = useRef(isRTL);
  const screenWidthRef = useRef(screenWidth);
  const drawerEdgeThresholdRef = useRef(drawerEdgeThreshold);

  useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  useEffect(() => {
    screenWidthRef.current = screenWidth;
    drawerEdgeThresholdRef.current = screenWidth * 0.2;
  }, [screenWidth]);

  // PanResponder for smooth animated tab swiping
  const tabSwipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          // Track where the touch started
          tabTouchStartXRef.current = evt.nativeEvent.pageX;
          return false; // Don't capture on start, let onMove decide
        },
        onMoveShouldSetPanResponder: (evt, gestureState: PanResponderGestureState) => {
          const startX = tabTouchStartXRef.current ?? evt.nativeEvent.pageX;
          const { dx, dy } = gestureState;
          const sw = screenWidthRef.current;
          const threshold = drawerEdgeThresholdRef.current;

          // Exclude drawer edge zone (first 20% in LTR, last 20% in RTL)
          if (isRTLRef.current) {
            // In RTL, drawer is on the right
            if (startX > sw - threshold) return false;
          } else {
            // In LTR, drawer is on the left
            if (startX < threshold) return false;
          }

          // Only capture horizontal swipes with sufficient movement
          return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15;
        },
        onPanResponderGrant: () => {
          // Stop any running animation when gesture starts
          slideAnim.stopAnimation();
        },
        onPanResponderMove: (_evt, gestureState: PanResponderGestureState) => {
          // Follow finger with animation (invert for RTL)
          const sw = screenWidthRef.current;
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const currentOffset = homeIndexRef.current === 0 ? 0 : -sw;
          // Clamp to valid range with resistance at edges
          let newValue = currentOffset + dx;
          if (newValue > 0) {
            newValue = newValue * 0.3; // Resistance when swiping past first tab
          } else if (newValue < -sw) {
            newValue = -sw + (newValue + sw) * 0.3; // Resistance when swiping past last tab
          }
          slideAnim.setValue(newValue);
        },
        onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
          const sw = screenWidthRef.current;
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const vx = isRTLRef.current ? -gestureState.vx : gestureState.vx;
          const currentIndex = homeIndexRef.current;

          // Determine target tab based on swipe distance and velocity
          let targetIndex = currentIndex;
          if (currentIndex === 0 && (dx < -sw / 4 || vx < -0.5)) {
            targetIndex = 1; // Swipe to Following
          } else if (currentIndex === 1 && (dx > sw / 4 || vx > 0.5)) {
            targetIndex = 0; // Swipe to For You
          }

          // Animate to target position
          Animated.spring(slideAnim, {
            toValue: targetIndex === 0 ? 0 : -sw,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();

          if (targetIndex !== currentIndex) {
            setHomeIndex(targetIndex);
          }
        },
        onPanResponderTerminate: () => {
          // If gesture is terminated (e.g., by scroll), snap back
          const sw = screenWidthRef.current;
          Animated.spring(slideAnim, {
            toValue: homeIndexRef.current === 0 ? 0 : -sw,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        },
      }),
    [slideAnim],
  );

  // Calculate translateX (invert for RTL)
  const translateX = isRTL ? Animated.multiply(slideAnim, -1) : slideAnim;

  return {
    translateX,
    tabSwipePanResponder,
    homeIndex,
    setHomeIndex,
    screenWidth,
  };
};

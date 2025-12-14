import { useEffect, useMemo, useRef } from 'react';
import { Animated, I18nManager, PanResponder, PanResponderGestureState, useWindowDimensions } from 'react-native';
import i18n from '../i18n';

interface UseSwipeableTabsGenericOptions {
  tabCount: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  swipeEnabled?: boolean;
}

/**
 * Generic hook for swipeable tabs that supports any number of tabs
 * Based on useSwipableTabs but generalized for N tabs
 */
export const useSwipeableTabsGeneric = ({
  tabCount,
  currentIndex,
  onIndexChange,
  swipeEnabled = true,
}: UseSwipeableTabsGenericOptions) => {
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const { width: screenWidth } = useWindowDimensions();

  // Animation value for tab sliding
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Animate to the selected tab when index changes
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -currentIndex * screenWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [currentIndex, slideAnim, screenWidth]);

  // Track touch start position
  const touchStartXRef = useRef<number | null>(null);
  const drawerEdgeThreshold = screenWidth * 0.2; // 20% of screen for drawer

  // Use refs to avoid stale closures in PanResponder
  const isRTLRef = useRef(isRTL);
  const screenWidthRef = useRef(screenWidth);
  const drawerEdgeThresholdRef = useRef(drawerEdgeThreshold);
  const tabCountRef = useRef(tabCount);

  useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  useEffect(() => {
    screenWidthRef.current = screenWidth;
    drawerEdgeThresholdRef.current = screenWidth * 0.2;
  }, [screenWidth]);

  useEffect(() => {
    tabCountRef.current = tabCount;
  }, [tabCount]);

  // PanResponder for smooth animated tab swiping
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          if (!swipeEnabled) return false;
          touchStartXRef.current = evt.nativeEvent.pageX;
          return false;
        },
        onMoveShouldSetPanResponder: (evt, gestureState: PanResponderGestureState) => {
          if (!swipeEnabled) return false;
          const startX = touchStartXRef.current ?? evt.nativeEvent.pageX;
          const { dx, dy } = gestureState;
          const sw = screenWidthRef.current;
          const threshold = drawerEdgeThresholdRef.current;

          // Exclude drawer edge zone
          if (isRTLRef.current) {
            if (startX > sw - threshold) return false;
          } else {
            if (startX < threshold) return false;
          }

          // Only capture horizontal swipes
          return Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15;
        },
        onPanResponderGrant: () => {
          slideAnim.stopAnimation();
        },
        onPanResponderMove: (_evt, gestureState: PanResponderGestureState) => {
          const sw = screenWidthRef.current;
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const currentOffset = -currentIndexRef.current * sw;
          const maxOffset = -(tabCountRef.current - 1) * sw;

          let newValue = currentOffset + dx;

          // Add resistance at edges
          if (newValue > 0) {
            newValue = newValue * 0.3; // Resistance when swiping past first tab
          } else if (newValue < maxOffset) {
            newValue = maxOffset + (newValue - maxOffset) * 0.3; // Resistance when swiping past last tab
          }

          slideAnim.setValue(newValue);
        },
        onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
          const sw = screenWidthRef.current;
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const vx = isRTLRef.current ? -gestureState.vx : gestureState.vx;
          const currentIdx = currentIndexRef.current;
          const numTabs = tabCountRef.current;

          let targetIndex = currentIdx;

          // Determine target tab based on swipe distance and velocity
          if (dx < -sw / 4 || vx < -0.5) {
            // Swipe left (next tab)
            targetIndex = Math.min(currentIdx + 1, numTabs - 1);
          } else if (dx > sw / 4 || vx > 0.5) {
            // Swipe right (previous tab)
            targetIndex = Math.max(currentIdx - 1, 0);
          }

          // Animate to target position
          Animated.spring(slideAnim, {
            toValue: -targetIndex * sw,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();

          if (targetIndex !== currentIdx) {
            onIndexChange(targetIndex);
          }
        },
        onPanResponderTerminate: () => {
          const sw = screenWidthRef.current;
          Animated.spring(slideAnim, {
            toValue: -currentIndexRef.current * sw,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        },
      }),
    [slideAnim, onIndexChange, swipeEnabled],
  );

  // Calculate translateX (invert for RTL)
  const translateX = isRTL ? Animated.multiply(slideAnim, -1) : slideAnim;

  return {
    translateX,
    panResponder,
    screenWidth,
  };
};

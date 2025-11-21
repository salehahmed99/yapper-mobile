import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Stack, usePathname } from 'expo-router';
import React from 'react';
import type { PanResponderGestureState } from 'react-native';
import { Animated, PanResponder, Pressable, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { UiShellProvider, useUiShell } from '../../context/UiShellContext';
import BottomNavigation from './BottomNavigation';
import SideMenu from './SideMenu';

const AppShell: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [anim] = React.useState(() => new Animated.Value(0));
  return (
    <UiShellProvider>
      <View style={styles.container}>
        <SlidingShell styles={styles} theme={theme} anim={anim} />
        <BottomNavigation anim={anim} />
      </View>
    </UiShellProvider>
  );
};

type AppShellStyles = {
  container: ViewStyle;
  content: ViewStyle;
  absoluteTranslate: ViewStyle;
  overlayBase: ViewStyle;
  pressableFlex: ViewStyle;
};

const createStyles = (theme: Theme): AppShellStyles =>
  StyleSheet.create<AppShellStyles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
    },
    absoluteTranslate: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
    },
    overlayBase: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 15,
      backgroundColor: theme.colors.background.primary,
    },
    pressableFlex: {
      flex: 1,
    },
  });

interface ISlidingShellProps {
  styles: AppShellStyles;
  theme: Theme;
  anim: Animated.Value;
}

const SlidingShell: React.FC<ISlidingShellProps> = React.memo(function SlidingShell(props) {
  const { styles, theme, anim } = props;
  const { isSideMenuOpen, closeSideMenu, openSideMenu } = useUiShell();
  const { width: screenWidth } = useWindowDimensions();
  const pathname = usePathname();
  const leftThreshold = screenWidth * 0.1; // Left 10% of screen
  const touchStartXRef = React.useRef<number | null>(null);

  // Only allow sidebar gesture on bottom nav tabs
  const bottomNavRoutes = ['/', '/search', '/grok', '/notifications', '/messages'];
  const isOnBottomNavTab = bottomNavRoutes.some((route) => pathname === route);

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isSideMenuOpen ? theme.ui.drawerWidth : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSideMenuOpen, anim, theme.ui.drawerWidth]);

  // PanResponder to allow edge swipe to open and drag-to-close when open
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, _gestureState) => {
          // Only handle gestures on bottom nav tabs
          if (!isOnBottomNavTab) return false;
          // Start when touching the left edge when closed; allow any start when open
          const startX = evt.nativeEvent.pageX ?? 0;
          touchStartXRef.current = startX;
          if (isSideMenuOpen) return true;
          return startX <= leftThreshold;
        },
        onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) => {
          // Only handle gestures on bottom nav tabs
          if (!isOnBottomNavTab) return false;
          // Capture horizontal drags larger than vertical
          // Only accept move if started in left region or menu is already open
          const { dx, dy } = gestureState;
          const startX = touchStartXRef.current ?? 0;
          if (!isSideMenuOpen && startX > leftThreshold) return false;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5;
        },
        onPanResponderMove: (_evt, gestureState: PanResponderGestureState) => {
          // Update anim value to follow finger
          const dx = gestureState.dx;
          const newVal = Math.max(0, Math.min(theme.ui.drawerWidth, isSideMenuOpen ? theme.ui.drawerWidth + dx : dx));
          anim.setValue(newVal);
        },
        onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
          const dx = gestureState.dx;
          const vx = gestureState.vx;
          const shouldOpen = (() => {
            if (isSideMenuOpen) {
              // user dragged left to close -> dx will be negative
              if (dx < -theme.ui.drawerWidth / 2 || vx < -0.5) return false;
              return true; // remain open
            }
            // when closed, user drags right to open
            if (dx > theme.ui.drawerWidth / 2 || vx > 0.5) return true;
            return false;
          })();
          Animated.timing(anim, {
            toValue: shouldOpen ? theme.ui.drawerWidth : 0,
            duration: 50,
            useNativeDriver: false,
          }).start(() => {
            if (shouldOpen) openSideMenu();
            else closeSideMenu();
          });
        },
      }),
    [isSideMenuOpen, anim, openSideMenu, closeSideMenu, theme.ui.drawerWidth, leftThreshold, isOnBottomNavTab],
  );
  // Animate overlay opacity and width with drawer
  const overlayOpacity = anim.interpolate({
    inputRange: [0, theme.ui.drawerWidth],
    outputRange: [0, 0.6],
    extrapolate: 'clamp',
  });
  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.absoluteTranslate, { transform: [{ translateX: anim }] }]}
      >
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
          <Animated.View
            style={[styles.overlayBase, { opacity: overlayOpacity }]}
            pointerEvents={isSideMenuOpen ? 'auto' : 'none'}
          >
            <Pressable
              style={styles.pressableFlex}
              onPress={() => {
                Animated.timing(anim, {
                  toValue: 0,
                  duration: 100,
                  useNativeDriver: false,
                }).start(() => closeSideMenu());
              }}
            />
          </Animated.View>
        </View>
      </Animated.View>
      {/* Drawer (placed here so panHandlers can be passed to it) */}
      <SideMenu anim={anim} panHandlers={panResponder.panHandlers} />
    </>
  );
});
export default React.memo(AppShell);

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useSocketConnection } from '@/src/hooks/useSocketConnection';
import useSyncExpoPushToken from '@/src/hooks/useSyncExpoPushToken';
import { useChatSocketListeners } from '@/src/modules/chat/hooks/useChatSocketListeners';
import { useNotificationSocketListeners } from '@/src/modules/notifications/hooks/useNotificationSocketListeners';
import { Stack, usePathname, useSegments } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PanResponderGestureState } from 'react-native';
import {
  Animated,
  I18nManager,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { UiShellProvider, useUiShell } from '../../context/UiShellContext';
import BottomNavigation from './BottomNavigation';
import SideMenu from './SideMenu';

const AppShell: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [anim] = React.useState(() => new Animated.Value(0));
  const segments = useSegments();

  // Sync push token
  useSyncExpoPushToken();

  // Manage socket connection lifecycle
  useSocketConnection();
  // Manage chat listeners
  useChatSocketListeners();
  // Manage notification listeners
  useNotificationSocketListeners();

  const isInSettings = (segments as string[]).includes('(settings)');
  const shouldShowBottomNav = !isInSettings;

  return (
    <UiShellProvider>
      <View style={styles.container}>
        <SlidingShell styles={styles} theme={theme} anim={anim} />
        {shouldShowBottomNav && <BottomNavigation anim={anim} />}
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
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const startThreshold = screenWidth * 0.2; // start 20% of screen
  const touchStartXRef = React.useRef<number | null>(null);

  // Only allow sidebar gesture on bottom nav tabs
  const bottomNavRoutes = ['/', '/search', '/notifications', '/messages'];
  const isOnBottomNavTab = bottomNavRoutes.some((route) => pathname === route);

  // Use refs to avoid stale closures in PanResponder
  const isSideMenuOpenRef = React.useRef(isSideMenuOpen);
  const isRTLRef = React.useRef(isRTL);
  const isOnBottomNavTabRef = React.useRef(isOnBottomNavTab);

  React.useEffect(() => {
    isSideMenuOpenRef.current = isSideMenuOpen;
  }, [isSideMenuOpen]);

  React.useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  React.useEffect(() => {
    isOnBottomNavTabRef.current = isOnBottomNavTab;
  }, [isOnBottomNavTab]);

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
        // Track touch start position but don't capture - allow taps on pressables
        onStartShouldSetPanResponderCapture: (evt) => {
          touchStartXRef.current = evt.nativeEvent.pageX ?? 0;
          return false; // Never capture on start - let child pressables receive taps
        },
        onStartShouldSetPanResponder: (evt, _gestureState) => {
          // Only handle gestures on bottom nav tabs
          if (!isOnBottomNavTabRef.current) return false;
          const startX = evt.nativeEvent.pageX ?? 0;
          touchStartXRef.current = startX;
          // Only capture immediately when menu is already open (for closing via tap on overlay)
          return isSideMenuOpenRef.current;
        },
        onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) => {
          // Only handle gestures on bottom nav tabs
          if (!isOnBottomNavTabRef.current) return false;
          const { dx, dy } = gestureState;
          const startX = touchStartXRef.current ?? 0;
          // Only capture if started in edge zone or menu is open
          if (!isSideMenuOpenRef.current) {
            if (isRTLRef.current && startX < screenWidth - startThreshold) return false;
            if (!isRTLRef.current && startX > startThreshold) return false;
          }
          // Only capture horizontal drags
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
        },
        onPanResponderMove: (_evt, gestureState: PanResponderGestureState) => {
          // Update anim value to follow finger
          // In RTL, dx is inverted (negative dx = opening, positive dx = closing)
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const currentlyOpen = isSideMenuOpenRef.current;
          const newVal = Math.max(0, Math.min(theme.ui.drawerWidth, currentlyOpen ? theme.ui.drawerWidth + dx : dx));
          anim.setValue(newVal);
        },
        onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
          // In RTL, invert dx and vx for correct gesture detection
          const dx = isRTLRef.current ? -gestureState.dx : gestureState.dx;
          const vx = isRTLRef.current ? -gestureState.vx : gestureState.vx;
          const currentlyOpen = isSideMenuOpenRef.current;
          const shouldOpen = (() => {
            if (currentlyOpen) {
              // user dragged start to close -> dx will be negative
              if (dx < -theme.ui.drawerWidth / 2 || vx < -0.5) return false;
              return true; // remain open
            }
            // when closed, user drags right to open (or left in RTL, but we already inverted dx)
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
    [anim, openSideMenu, closeSideMenu, theme.ui.drawerWidth, startThreshold, screenWidth],
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
        style={[styles.absoluteTranslate, { transform: [{ translateX: isRTL ? Animated.multiply(anim, -1) : anim }] }]}
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

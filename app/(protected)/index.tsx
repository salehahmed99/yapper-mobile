import HomeTabView from '@/src/components/home/HomeTabView';
import YapperLogo from '@/src/components/icons/YapperLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import CreatePostModal from '@/src/modules/tweets/components/CreatePostModal';
import Fab from '@/src/modules/tweets/components/Fab';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { useTweetsFiltersStore } from '@/src/modules/tweets/store/useTweetsFiltersStore';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  I18nManager,
  PanResponder,
  PanResponderGestureState,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { top, bottom } = useSpacing();
  const styles = createStyles(theme);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const { width: screenWidth } = useWindowDimensions();

  // Animation value for tab sliding (0 = For You visible, -screenWidth = Following visible)
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const [homeIndex, setHomeIndex] = useState(0);
  const homeIndexRef = React.useRef(homeIndex);
  React.useEffect(() => {
    homeIndexRef.current = homeIndex;
  }, [homeIndex]);

  // Animate to the selected tab when index changes (e.g., from tab bar tap)
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: homeIndex === 0 ? 0 : -screenWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [homeIndex, slideAnim, screenWidth]);

  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);

  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);
  const forYouQuery = useTweets(tweetsFilters, 'for-you');
  const followingQuery = useTweets(tweetsFilters, 'following');

  const forYouTweets = React.useMemo(() => {
    return forYouQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [forYouQuery.data]);

  const followingTweets = React.useMemo(() => {
    return followingQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [followingQuery.data]);

  const onForYouRefresh = React.useCallback(() => {
    forYouQuery.refetch();
  }, [forYouQuery.refetch]);

  const onForYouEndReached = React.useCallback(() => {
    if (forYouQuery.hasNextPage && !forYouQuery.isFetchingNextPage) {
      forYouQuery.fetchNextPage();
    }
  }, [forYouQuery.hasNextPage, forYouQuery.isFetchingNextPage, forYouQuery.fetchNextPage]);

  const onFollowingRefresh = React.useCallback(() => {
    followingQuery.refetch();
  }, [followingQuery.refetch]);

  const onFollowingEndReached = React.useCallback(() => {
    if (followingQuery.hasNextPage && !followingQuery.isFetchingNextPage) {
      followingQuery.fetchNextPage();
    }
  }, [followingQuery.hasNextPage, followingQuery.isFetchingNextPage, followingQuery.fetchNextPage]);

  // Track touch start position for tab swipe
  const tabTouchStartXRef = React.useRef<number | null>(null);
  const drawerEdgeThreshold = screenWidth * 0.2; // 20% of screen for drawer

  // Use refs to avoid stale closures in PanResponder (same pattern as AppShell)
  const isRTLRef = React.useRef(isRTL);
  const screenWidthRef = React.useRef(screenWidth);
  const drawerEdgeThresholdRef = React.useRef(drawerEdgeThreshold);

  React.useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  React.useEffect(() => {
    screenWidthRef.current = screenWidth;
    drawerEdgeThresholdRef.current = screenWidth * 0.2;
  }, [screenWidth]);

  // PanResponder for smooth animated tab swiping
  const tabSwipePanResponder = React.useMemo(
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
    [isRTL, screenWidth, slideAnim, drawerEdgeThreshold],
  );

  const { addPostMutation } = useTweetActions();

  // Calculate translateX (invert for RTL)
  const translateX = isRTL ? Animated.multiply(slideAnim, -1) : slideAnim;

  return (
    <View style={styles.container}>
      <MediaViewerProvider>
        <View style={styles.appBarWrapper}>
          <AppBar
            children={<YapperLogo size={32} color={theme.colors.text.primary} />}
            tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
          />
        </View>
        <MediaViewerModal />
        {/* Swipeable tab container */}
        <View style={styles.tabsOuterContainer} {...tabSwipePanResponder.panHandlers}>
          <Animated.View style={[styles.tabsInnerContainer, { width: screenWidth * 2, transform: [{ translateX }] }]}>
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <TweetList
                data={forYouTweets}
                onRefresh={onForYouRefresh}
                refreshing={forYouQuery.isRefetching}
                onEndReached={onForYouEndReached}
                onEndReachedThreshold={0.5}
                isLoading={forYouQuery.isLoading}
                isFetchingNextPage={forYouQuery.isFetchingNextPage}
                useCustomRefreshIndicator={Platform.OS === 'ios'}
                topSpacing={top}
                bottomSpacing={bottom}
              />
            </View>
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <TweetList
                data={followingTweets}
                onRefresh={onFollowingRefresh}
                refreshing={followingQuery.isRefetching}
                onEndReached={onFollowingEndReached}
                onEndReachedThreshold={0.5}
                isLoading={followingQuery.isLoading}
                isFetchingNextPage={followingQuery.isFetchingNextPage}
                useCustomRefreshIndicator={Platform.OS === 'ios'}
                topSpacing={top}
                bottomSpacing={bottom}
              />
            </View>
          </Animated.View>
        </View>
        <Fab onPress={() => setIsCreatePostModalVisible(true)} />
        <CreatePostModal
          visible={isCreatePostModalVisible}
          onClose={() => setIsCreatePostModalVisible(false)}
          onPost={(content, mediaUris) => addPostMutation.mutate({ content, mediaUris })}
          type="tweet"
        />
      </MediaViewerProvider>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    appBarWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    tabsOuterContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    tabsInnerContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    tabPage: {
      flex: 1,
    },
  });

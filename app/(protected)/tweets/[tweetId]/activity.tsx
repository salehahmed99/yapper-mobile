import { ThemedText } from '@/src/components/ThemedText';
import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import useSpacing from '@/src/hooks/useSpacing';
import { useSwipeableTabsGeneric } from '@/src/hooks/useSwipeableTabsGeneric';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetQuotesList from '@/src/modules/tweets/components/TweetQuotesList';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserList from '@/src/modules/user_list/components/UserList';
import { useAuthStore } from '@/src/store/useAuthStore';
import { IUser } from '@/src/types/user';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TweetActivityScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const { navigate, goBack } = useNavigation();
  const { tweetId, ownerId } = useLocalSearchParams<{ tweetId: string; ownerId?: string }>();
  const { bottom } = useSpacing();
  const user = useAuthStore((state) => state.user);
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);

  useEffect(() => {
    if (!user) {
      fetchAndUpdateUser();
    }
  }, [user, fetchAndUpdateUser]);

  const currentUserId = user?.id ?? null;
  const isTweetOwner = ownerId ? ownerId === currentUserId : false;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleUserPress = useCallback(
    (selectedUser: IUser) => {
      navigate({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: selectedUser.id },
      });
    },
    [navigate],
  );

  const RepostsTab = useMemo(
    () =>
      function RepostsTab() {
        return (
          <UserList
            key={`reposts-${tweetId}`}
            type="reposts"
            tweetId={tweetId || ''}
            onUserPress={handleUserPress}
            renderAction={(user: IUser) => <FollowButton user={user} />}
          />
        );
      },
    [tweetId, handleUserPress],
  );

  const QuotesTab = useMemo(
    () =>
      function QuotesTab() {
        return <TweetQuotesList tweetId={tweetId || ''} />;
      },
    [tweetId],
  );

  const LikersTab = useMemo(
    () =>
      function LikersTab() {
        return (
          <UserList
            key={`likers-${tweetId}`}
            type="likes"
            tweetId={tweetId || ''}
            onUserPress={handleUserPress}
            renderAction={(user: IUser) => <FollowButton user={user} />}
          />
        );
      },
    [tweetId, handleUserPress],
  );

  const routes = useMemo(() => {
    const base = [
      { key: 'reposts', title: t('tweetActivity.tabs.reposts') },
      { key: 'quotes', title: t('tweetActivity.tabs.quotes') },
    ];
    if (isTweetOwner) {
      base.push({ key: 'likers', title: t('tweetActivity.tabs.likers') });
    }
    return base;
  }, [t, isTweetOwner]);

  const { translateX, panResponder, screenWidth } = useSwipeableTabsGeneric({
    tabCount: routes.length,
    currentIndex: activeIndex,
    onIndexChange: setActiveIndex,
    swipeEnabled: true,
  });

  return (
    <MediaViewerProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => goBack()} accessibilityLabel="back_button" style={styles.backButton}>
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>{t('tweetActivity.title')}</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </View>
        <View style={styles.tabsOuterContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[styles.tabsInnerContainer, { width: screenWidth * routes.length, transform: [{ translateX }] }]}
          >
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <RepostsTab />
            </View>
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <QuotesTab />
            </View>
            {isTweetOwner && (
              <View style={[styles.tabPage, { width: screenWidth }]}>
                <LikersTab />
              </View>
            )}
          </Animated.View>
        </View>
        <View style={{ height: bottom }} />
        <MediaViewerModal />
      </View>
    </MediaViewerProvider>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: theme.spacing.xxxxl,
    },
    header: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: theme.ui.appBarHeight,
      paddingHorizontal: theme.spacing.md,
    },
    backButton: {
      width: theme.ui.sideContainerWidth,
      height: theme.ui.sideContainerWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    placeholder: {
      width: theme.ui.sideContainerWidth,
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

import AppBar from '@/src/components/shell/AppBar';
import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import useMargins from '@/src/hooks/useSpacing';
import { useSwipableTabs } from '@/src/hooks/useSwipableTabs';
import NotificationsList from '@/src/modules/notifications/components/NotificationsList';
import NotificationsTabView from '@/src/modules/notifications/components/NotificationsTabView';
import { useMentions } from '@/src/modules/notifications/hooks/useMentions';
import { useNotifications } from '@/src/modules/notifications/hooks/useNotifications';
import { notificationSocketService } from '@/src/modules/notifications/services/notificationSocketService';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  // Mark all notifications as seen

  React.useEffect(() => {
    notificationSocketService.markSeen();
  }, []);

  // Get notifications and mentions
  const notificationsQuery = useNotifications();
  const mentionsQuery = useMentions();

  const notifications = React.useMemo(() => {
    return (
      notificationsQuery.data?.pages
        .flatMap((page) => page.notifications)
        .filter((notification) => notification.type !== 'message') ?? []
    );
  }, [notificationsQuery.data]);

  React.useEffect(() => {
    if (notifications.length === 0 && notificationsQuery.hasNextPage) {
      notificationsQuery.fetchNextPage();
    }
  }, [notifications.length, notificationsQuery.hasNextPage]);
  const mentions = React.useMemo(() => {
    return mentionsQuery.data?.pages.flatMap((page) => page.notifications) ?? [];
  }, [mentionsQuery.data]);

  const onNotificationsRefresh = React.useCallback(() => {
    notificationsQuery.refetch();
  }, [notificationsQuery.refetch]);

  const onMentionsRefresh = React.useCallback(() => {
    mentionsQuery.refetch();
  }, [mentionsQuery.refetch]);

  const onNotificationsEndReached = React.useCallback(() => {
    if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
      notificationsQuery.fetchNextPage();
    }
  }, [notificationsQuery.hasNextPage, notificationsQuery.isFetchingNextPage, notificationsQuery.fetchNextPage]);

  const onMentionsEndReached = React.useCallback(() => {
    if (mentionsQuery.hasNextPage && !mentionsQuery.isFetchingNextPage) {
      mentionsQuery.fetchNextPage();
    }
  }, [mentionsQuery.hasNextPage, mentionsQuery.isFetchingNextPage, mentionsQuery.fetchNextPage]);

  const { top, bottom } = useMargins();

  const { translateX, tabSwipePanResponder, homeIndex, setHomeIndex, screenWidth } = useSwipableTabs();

  return (
    <View style={styles.container}>
      <MediaViewerProvider>
        <View style={styles.appBarWrapper}>
          <AppBar
            children={<Text style={styles.appBarTitle}>{t('notifications.title')}</Text>}
            tabView={<NotificationsTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
          />
        </View>
        <MediaViewerModal />
        <View style={styles.tabsOuterContainer} {...tabSwipePanResponder.panHandlers}>
          <Animated.View style={[styles.tabsInnerContainer, { width: screenWidth * 2, transform: [{ translateX }] }]}>
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <NotificationsList
                data={notifications}
                onRefresh={onNotificationsRefresh}
                refreshing={notificationsQuery.isRefetching}
                onEndReached={onNotificationsEndReached}
                onEndReachedThreshold={0.5}
                isLoading={notificationsQuery.isLoading}
                isFetchingNextPage={notificationsQuery.isFetchingNextPage}
                useCustomRefreshIndicator={Platform.OS === 'ios'}
                topSpacing={top}
                bottomSpacing={bottom}
              />
            </View>
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <NotificationsList
                data={mentions}
                onRefresh={onMentionsRefresh}
                refreshing={mentionsQuery.isRefetching}
                onEndReached={onMentionsEndReached}
                onEndReachedThreshold={0.5}
                isLoading={mentionsQuery.isLoading}
                isFetchingNextPage={mentionsQuery.isFetchingNextPage}
                useCustomRefreshIndicator={Platform.OS === 'ios'}
                topSpacing={top}
                bottomSpacing={bottom}
              />
            </View>
          </Animated.View>
        </View>
      </MediaViewerProvider>
    </View>
  );
};

export default NotificationsScreen;

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
    appBarTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
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

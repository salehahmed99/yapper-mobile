import CustomTabView from '@/src/components/CustomTabView';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useSwipeableTabsGeneric } from '../../../hooks/useSwipeableTabsGeneric';
import { useAuthStore } from '../../../store/useAuthStore';
import { ITweet } from '../../tweets/types';
import { useProfilePosts } from '../context/ProfilePostsContext';
import { useUserLikesData } from '../hooks/useUserLikes';
import { useUserMediaData } from '../hooks/useUserMedia';
import { useUserPostsData } from '../hooks/useUserPosts';
import { useUserRepliesData } from '../hooks/useUserReplies';
import ProfilePostsList from './ProfilePostsList';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background.primary },
    placeholderText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    tabsOuterContainer: {
      flex: 1,
      overflow: 'hidden',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabsInnerContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    tabPage: {
      flex: 1,
    },
  });

interface ProfileTabsProps {
  userId?: string;
}

const PostsRoute = ({ userId, activeTabKey }: { userId: string; activeTabKey?: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isActive = activeTabKey === 'posts';
  const { posts, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserPostsData(
    userId,
    isActive,
  );
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    if (isActive) {
      registerFetchNextPage(
        () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        hasNextPage ?? false,
        isFetchingNextPage,
      );
    }
  }, [isActive, registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isActive) {
      registerRefresh(() => {
        refetch();
      });
    }
  }, [isActive, registerRefresh, refetch]);

  if (isLoading) {
    return (
      <View style={styles.page} testID="posts_route_loading">
        <LoadingIndicator />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.page} testID="posts_route_empty">
        <Text style={styles.placeholderText}>{t('profile.placeholders.posts')}</Text>
      </View>
    );
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.page}>
      <ProfilePostsList
        data={posts}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        isTabActive={isActive}
      />
    </View>
  );
};

const RepliesRoute = ({ userId, activeTabKey }: { userId: string; activeTabKey?: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isActive = activeTabKey === 'replies';
  const { replies, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserRepliesData(
    userId,
    isActive,
  );
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    if (isActive) {
      registerFetchNextPage(
        () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        hasNextPage ?? false,
        isFetchingNextPage,
      );
    }
  }, [isActive, registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isActive) {
      registerRefresh(() => {
        refetch();
      });
    }
  }, [isActive, registerRefresh, refetch]);

  if (isLoading) {
    return (
      <View style={styles.page} testID="replies_route_loading">
        <LoadingIndicator />
      </View>
    );
  }

  if (replies.length === 0) {
    return (
      <View style={styles.page} testID="replies_route_empty">
        <Text style={styles.placeholderText}>{t('profile.placeholders.replies')}</Text>
      </View>
    );
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.page}>
      <ProfilePostsList
        data={replies}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        isTabActive={isActive}
      />
    </View>
  );
};

const MediaRoute = ({ userId, activeTabKey }: { userId: string; activeTabKey?: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isActive = activeTabKey === 'media';
  const { media, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserMediaData(
    userId,
    isActive,
  );
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    if (isActive) {
      registerFetchNextPage(
        () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        hasNextPage ?? false,
        isFetchingNextPage,
      );
    }
  }, [isActive, registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isActive) {
      registerRefresh(() => {
        refetch();
      });
    }
  }, [isActive, registerRefresh, refetch]);

  if (isLoading) {
    return (
      <View style={styles.page} testID="media_route_loading">
        <LoadingIndicator />
      </View>
    );
  }

  if (media.length === 0) {
    return (
      <View style={styles.page} testID="media_route_empty">
        <Text style={styles.placeholderText}>{t('profile.placeholders.media')}</Text>
      </View>
    );
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.page}>
      <ProfilePostsList
        data={media}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        isTabActive={isActive}
      />
    </View>
  );
};

const LikesRoute = ({ userId, activeTabKey }: { userId: string; activeTabKey?: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isActive = activeTabKey === 'likes';
  const { likes, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserLikesData(
    userId,
    isActive,
  );
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    if (isActive) {
      registerFetchNextPage(
        () => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        hasNextPage ?? false,
        isFetchingNextPage,
      );
    }
  }, [isActive, registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isActive) {
      registerRefresh(() => {
        refetch();
      });
    }
  }, [isActive, registerRefresh, refetch]);

  if (isLoading) {
    return (
      <View style={styles.page} testID="likes_route_loading">
        <LoadingIndicator />
      </View>
    );
  }

  if (likes.length === 0) {
    return (
      <View style={styles.page} testID="likes_route_empty">
        <Text style={styles.placeholderText}>{t('profile.placeholders.likes')}</Text>
      </View>
    );
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.page}>
      <ProfilePostsList
        data={likes as ITweet[]}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        isTabActive={isActive}
      />
    </View>
  );
};

const ProfileTabs = React.memo(({ userId }: ProfileTabsProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currentUser = useAuthStore((state) => state.user);
  const effectiveUserId = userId || currentUser?.id || '';
  const isOwnProfile = !userId || userId === currentUser?.id;

  const [activeIndex, setActiveIndex] = useState(0);

  const routes = useMemo(
    () => [
      { key: 'posts', title: t('profile.tabs.posts') },
      {
        key: 'replies',
        title: t('profile.tabs.replies'),
      },
      { key: 'media', title: t('profile.tabs.media') },
      ...(isOwnProfile
        ? [
            {
              key: 'likes',
              title: t('profile.tabs.likes'),
            },
          ]
        : []),
    ],
    [t, isOwnProfile],
  );

  const activeTabKey = routes[activeIndex]?.key;

  const { translateX, panResponder, screenWidth } = useSwipeableTabsGeneric({
    tabCount: routes.length,
    currentIndex: activeIndex,
    onIndexChange: setActiveIndex,
    swipeEnabled: true,
  });

  return (
    <>
      <CustomTabView routes={routes} index={activeIndex} onIndexChange={setActiveIndex} scrollable={false} />
      <View style={styles.tabsOuterContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[styles.tabsInnerContainer, { width: screenWidth * routes.length, transform: [{ translateX }] }]}
        >
          <View style={[styles.tabPage, { width: screenWidth }]}>
            <PostsRoute userId={effectiveUserId} activeTabKey={activeTabKey} />
          </View>
          <View style={[styles.tabPage, { width: screenWidth }]}>
            <RepliesRoute userId={effectiveUserId} activeTabKey={activeTabKey} />
          </View>
          <View style={[styles.tabPage, { width: screenWidth }]}>
            <MediaRoute userId={effectiveUserId} activeTabKey={activeTabKey} />
          </View>
          {isOwnProfile && (
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <LikesRoute userId={effectiveUserId} activeTabKey={activeTabKey} />
            </View>
          )}
        </Animated.View>
      </View>
    </>
  );
});

ProfileTabs.displayName = 'ProfileTabs';

export default ProfileTabs;

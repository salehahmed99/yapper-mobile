import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { ITweet } from '../../tweets/types';
import { useProfilePosts } from '../context/ProfilePostsContext';
import { useUserLikesData } from '../hooks/useUserLikes';
import { useUserMediaData } from '../hooks/useUserMedia';
import { useUserPostsData } from '../hooks/useUserPosts';
import { useUserRepliesData } from '../hooks/useUserReplies';
import CustomTabView, { TabConfig } from './CustomTabView';
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
  });

interface ProfileTabsProps {
  userId?: string;
}

const PostsRoute = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { posts, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserPostsData(userId);
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    registerFetchNextPage(
      () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      hasNextPage ?? false,
      isFetchingNextPage,
    );
  }, [registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    registerRefresh(() => {
      refetch();
    });
  }, [registerRefresh, refetch]);

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
        <Text style={styles.placeholderText}>{t('profile.placeholders.tweets')}</Text>
      </View>
    );
  }

  const handleScroll = (event: {
    nativeEvent: {
      layoutMeasurement: { height: number };
      contentOffset: { y: number };
      contentSize: { height: number };
    };
  }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScrollView style={styles.page} onScroll={handleScroll} scrollEventThrottle={400}>
      <ProfilePostsList data={posts} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
    </ScrollView>
  );
};

const RepliesRoute = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { replies, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserRepliesData(userId);
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    registerFetchNextPage(
      () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      hasNextPage ?? false,
      isFetchingNextPage,
    );
  }, [registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    registerRefresh(() => {
      refetch();
    });
  }, [registerRefresh, refetch]);

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
        <Text style={styles.placeholderText}>{t('profile.placeholders.tweetsReplies')}</Text>
      </View>
    );
  }

  const handleScroll = (event: {
    nativeEvent: {
      layoutMeasurement: { height: number };
      contentOffset: { y: number };
      contentSize: { height: number };
    };
  }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScrollView style={styles.page} onScroll={handleScroll} scrollEventThrottle={400}>
      <ProfilePostsList data={replies} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
    </ScrollView>
  );
};

const MediaRoute = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { media, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserMediaData(userId);
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    registerFetchNextPage(
      () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      hasNextPage ?? false,
      isFetchingNextPage,
    );
  }, [registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    registerRefresh(() => {
      refetch();
    });
  }, [registerRefresh, refetch]);

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

  const handleScroll = (event: {
    nativeEvent: {
      layoutMeasurement: { height: number };
      contentOffset: { y: number };
      contentSize: { height: number };
    };
  }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScrollView style={styles.page} onScroll={handleScroll} scrollEventThrottle={400}>
      <ProfilePostsList data={media} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
    </ScrollView>
  );
};

const LikesRoute = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { likes, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useUserLikesData(userId);
  const { registerFetchNextPage, registerRefresh } = useProfilePosts();

  useEffect(() => {
    registerFetchNextPage(
      () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      hasNextPage ?? false,
      isFetchingNextPage,
    );
  }, [registerFetchNextPage, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    registerRefresh(() => {
      refetch();
    });
  }, [registerRefresh, refetch]);

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

  const handleScroll = (event: {
    nativeEvent: {
      layoutMeasurement: { height: number };
      contentOffset: { y: number };
      contentSize: { height: number };
    };
  }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScrollView style={styles.page} onScroll={handleScroll} scrollEventThrottle={400}>
      <ProfilePostsList data={likes as ITweet[]} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} />
    </ScrollView>
  );
};

const ProfileTabs = React.memo(({ userId }: ProfileTabsProps) => {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const effectiveUserId = userId || currentUser?.id || '';
  const isOwnProfile = !userId || userId === currentUser?.id;

  const tabs: TabConfig[] = useMemo(
    () => [
      { key: 'tweets', title: t('profile.tabs.tweets'), component: () => <PostsRoute userId={effectiveUserId} /> },
      {
        key: 'tweetsReplies',
        title: t('profile.tabs.tweetsReplies'),
        component: () => <RepliesRoute userId={effectiveUserId} />,
      },
      { key: 'media', title: t('profile.tabs.media'), component: () => <MediaRoute userId={effectiveUserId} /> },
      ...(isOwnProfile
        ? [
            {
              key: 'likes',
              title: t('profile.tabs.likes'),
              component: () => <LikesRoute userId={effectiveUserId} />,
            },
          ]
        : []),
    ],
    [t, effectiveUserId, isOwnProfile],
  );

  return <CustomTabView tabs={tabs} scrollEnabled={true} />;
});

ProfileTabs.displayName = 'ProfileTabs';

export default ProfileTabs;

import CustomTabView from '@/src/components/CustomTabView';
import AppBar from '@/src/components/shell/AppBar';
import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import useSpacing from '@/src/hooks/useSpacing';
import { useSwipeableTabsGeneric } from '@/src/hooks/useSwipeableTabsGeneric';
import SearchInput from '@/src/modules/search/components/SearchInput';
import { useSearchPosts } from '@/src/modules/search/hooks/useSearchPosts';
import { useSearchUsers } from '@/src/modules/search/hooks/useSearchUsers';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetList from '@/src/modules/tweets/components/TweetList';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserListItem from '@/src/modules/user_list/components/UserListItem';
import { IUser } from '@/src/types/user';
import { useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

// Context for sharing search params with tab components
interface SearchResultsContextType {
  query: string;
  username?: string;
}

const SearchResultsContext = createContext<SearchResultsContextType>({ query: '' });

const useSearchResultsContext = () => useContext(SearchResultsContext);

// Memoized empty state component
const EmptyState = memo(({ message, theme }: { message: string; theme: Theme }) => (
  <View style={createEmptyStyles(theme).emptyContainer}>
    <Text style={createEmptyStyles(theme).emptyText}>{message}</Text>
  </View>
));

const createEmptyStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
  });

// Stable tab components defined OUTSIDE the main component
const PostsTab: React.FC<{ activeTabKey?: string }> = memo(({ activeTabKey }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { query, username } = useSearchResultsContext();
  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } = useSearchPosts({
    query,
    type: 'posts',
    username,
    enabled: query.length > 0 && activeTabKey === 'posts',
  });

  const tweets = useMemo(() => data?.pages.flatMap((page) => page.data.data) ?? [], [data]);

  if (!isLoading && tweets.length === 0) {
    return <EmptyState message={t('search.noPosts', 'No posts found for this search')} theme={theme} />;
  }

  return (
    <TweetList
      data={tweets}
      onRefresh={refetch}
      refreshing={isRefetching}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isTabActive={activeTabKey === 'posts'}
      bottomSpacing={!hasNextPage && tweets.length > 0 ? 120 : 0}
    />
  );
});

const MediaTab: React.FC<{ activeTabKey?: string }> = memo(({ activeTabKey }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { query, username } = useSearchResultsContext();
  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } = useSearchPosts({
    query,
    type: 'media',
    username,
    enabled: query.length > 0 && activeTabKey === 'media',
  });

  const tweets = useMemo(() => data?.pages.flatMap((page) => page.data.data) ?? [], [data]);

  if (!isLoading && tweets.length === 0) {
    return <EmptyState message={t('search.noMedia', 'No media found for this search')} theme={theme} />;
  }

  return (
    <TweetList
      data={tweets}
      onRefresh={refetch}
      refreshing={isRefetching}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isTabActive={activeTabKey === 'media'}
      bottomSpacing={!hasNextPage && tweets.length > 0 ? 120 : 0}
    />
  );
});

const LatestTab: React.FC<{ activeTabKey?: string }> = memo(({ activeTabKey }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { query, username } = useSearchResultsContext();
  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } = useSearchPosts({
    query,
    type: 'latest',
    username,
    enabled: query.length > 0 && activeTabKey === 'latest',
  });

  const tweets = useMemo(() => data?.pages.flatMap((page) => page.data.data) ?? [], [data]);

  if (!isLoading && tweets.length === 0) {
    return <EmptyState message={t('search.noLatest', 'No recent posts found for this search')} theme={theme} />;
  }

  return (
    <TweetList
      data={tweets}
      onRefresh={refetch}
      refreshing={isRefetching}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isTabActive={activeTabKey === 'latest'}
      bottomSpacing={!hasNextPage && tweets.length > 0 ? 120 : 0}
    />
  );
});

const UsersTab: React.FC<{ activeTabKey?: string }> = memo(({ activeTabKey }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { navigate } = useNavigation();
  const { query, username } = useSearchResultsContext();
  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } = useSearchUsers({
    query,
    username,
    enabled: query.length > 0 && activeTabKey === 'users',
  });

  const users = useMemo(() => data?.pages.flatMap((page) => page.data.data) ?? [], [data]);

  const handleUserPress = useCallback(
    (user: IUser) => {
      navigate({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: user.id },
      });
    },
    [navigate],
  );

  const renderItem = useCallback(
    ({ item }: { item: IUser }) => (
      <UserListItem user={item} onPress={handleUserPress} renderAction={(user) => <FollowButton user={user} />} />
    ),
    [handleUserPress],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.text.link} />
      </View>
    );
  }

  if (users.length === 0) {
    return <EmptyState message={t('search.noUsers', 'No users found for this search')} theme={theme} />;
  }

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListFooterComponent={() => <View style={styles.listFooter} />}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.text.link} />
      }
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
    />
  );
});

export default function SearchResultsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const { top } = useSpacing();
  const params = useLocalSearchParams<{ query: string; username?: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [query, setQuery] = useState(params.query || '');
  const [activeQuery, setActiveQuery] = useState(params.query || '');
  const [activeIndex, setActiveIndex] = useState(0);
  const username = params.username || undefined;

  const handleSubmit = useCallback(() => {
    if (query.trim().length > 0) {
      setActiveQuery(query.trim());
    }
  }, [query]);

  const handleSearchFocus = useCallback(() => {
    navigate({
      pathname: '/(protected)/search/search-suggestions' as any,
      params: { query: query, ...(username && { username }) },
    });
  }, [navigate, query, username]);

  const handleClear = useCallback(() => {
    navigate({
      pathname: '/(protected)/search/search-suggestions' as any,
      params: { query: '', ...(username && { username }) },
    });
  }, [navigate, username]);

  const contextValue = useMemo(() => ({ query: activeQuery, username }), [activeQuery, username]);

  const routes = useMemo(
    () => [
      { key: 'posts', title: t('search.tabs.posts', 'Posts') },
      { key: 'media', title: t('search.tabs.media', 'Media') },
      { key: 'latest', title: t('search.tabs.latest', 'Latest') },
      { key: 'users', title: t('search.tabs.users', 'Users') },
    ],
    [t],
  );

  const activeTabKey = routes[activeIndex]?.key;

  const { translateX, panResponder, screenWidth } = useSwipeableTabsGeneric({
    tabCount: routes.length,
    currentIndex: activeIndex,
    onIndexChange: setActiveIndex,
    swipeEnabled: true,
  });

  return (
    <View style={styles.container}>
      <SearchResultsContext.Provider value={contextValue}>
        <MediaViewerProvider>
          <View style={styles.appBarWrapper}>
            <AppBar
              children={
                <SearchInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmit={handleSubmit}
                  onFocus={handleSearchFocus}
                  autoFocus={false}
                />
              }
              rightElement={
                query.length > 0 ? (
                  <Pressable
                    onPress={handleClear}
                    accessibilityLabel={t('search.clear', 'Clear')}
                    accessibilityRole="button"
                    style={styles.clearButton}
                    testID="search_clear_button"
                  >
                    <X size={20} color={theme.colors.text.secondary} />
                  </Pressable>
                ) : null
              }
              tabView={
                <CustomTabView routes={routes} index={activeIndex} onIndexChange={setActiveIndex} scrollable={true} />
              }
            />
          </View>
          <View style={styles.tabsOuterContainer} {...panResponder.panHandlers}>
            <Animated.View
              style={[styles.tabsInnerContainer, { width: screenWidth * routes.length, transform: [{ translateX }] }]}
            >
              <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
                <PostsTab activeTabKey={activeTabKey} />
              </View>
              <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
                <MediaTab activeTabKey={activeTabKey} />
              </View>
              <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
                <LatestTab activeTabKey={activeTabKey} />
              </View>
              <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
                <UsersTab activeTabKey={activeTabKey} />
              </View>
            </Animated.View>
          </View>
          <MediaViewerModal />
        </MediaViewerProvider>
      </SearchResultsContext.Provider>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listFooter: {
      height: 120,
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
    clearButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

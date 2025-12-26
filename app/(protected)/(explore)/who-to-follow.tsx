import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useWhoToFollow } from '@/src/modules/explore/hooks/useWhoToFollow';
import { IExploreUser } from '@/src/modules/explore/types';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserListItem from '@/src/modules/user_list/components/UserListItem';
import { IUser } from '@/src/types/user';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
  });

// Map IExploreUser to IUser for compatibility with UserListItem
const mapExploreUserToUser = (user: IExploreUser): IUser => ({
  id: user.id,
  name: user.name,
  username: user.username,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  verified: user.verified,
  followers: user.followers,
  following: user.following,
  isFollowing: user.isFollowing,
  isFollower: user.isFollowed,
  email: '',
});

export default function WhoToFollowScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { navigate, goBack } = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use React Query hook for caching
  const { data, isLoading, isRefetching, refetch, error } = useWhoToFollow();
  const users = data?.data || [];

  const handleUserPress = useCallback(
    (user: IUser) => {
      navigate({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: user.id },
      });
    },
    [navigate],
  );

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const renderItem = useCallback(
    ({ item }: { item: IExploreUser }) => {
      const user = mapExploreUserToUser(item);
      return <UserListItem user={user} onPress={handleUserPress} renderAction={(u) => <FollowButton user={u} />} />;
    },
    [handleUserPress],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text.link} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{t('explore.errors.fetchFailed', 'Failed to load suggestions')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('explore.noSuggestions', 'No suggestions available')}</Text>
      </View>
    );
  }, [isLoading, error, styles, theme.colors.text.link, t]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={theme.iconSizes.md} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('explore.connect', 'Connect')}</Text>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={() => <View style={{ height: insets.bottom + 60 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={theme.colors.text.link} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

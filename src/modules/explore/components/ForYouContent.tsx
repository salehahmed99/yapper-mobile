import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserListItem from '@/src/modules/user_list/components/UserListItem';
import { IUser } from '@/src/types/user';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IExploreCategory, IExploreTrending, IExploreUser, ITrendItem } from '../types';
import TrendingItem from './TrendingItem';
import TweetCategorySection from './TweetCategorySection';

interface IForYouContentProps {
  trending: IExploreTrending[];
  whoToFollow: IExploreUser[];
  forYouPosts: IExploreCategory[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onTrendingPress?: (trending: IExploreTrending | ITrendItem) => void;
  onUserPress?: (user: IUser) => void;
  onShowMoreUsers?: () => void;
  onCategoryShowMore?: (categoryId: string, categoryName: string) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: theme.borderWidth.thin / 2,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    showMoreText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.link,
    },
    divider: {
      height: theme.spacing.lg,
      backgroundColor: theme.colors.background.secondary,
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

const ForYouContent: React.FC<IForYouContentProps> = ({
  trending = [],
  whoToFollow = [],
  forYouPosts = [],
  loading = false,
  refreshing = false,
  onRefresh,
  onTrendingPress,
  onUserPress,
  onShowMoreUsers,
  onCategoryShowMore,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (loading && (!trending || trending.length === 0) && (!whoToFollow || whoToFollow.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text.secondary} />
      </View>
    );
  }

  return (
    <MediaViewerProvider>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.text.link}
              colors={[theme.colors.text.link]}
              progressBackgroundColor={theme.colors.background.primary}
            />
          ) : undefined
        }
      >
        {/* Trending Section */}
        {Array.isArray(trending) &&
          trending.map((item, index) => (
            <TrendingItem
              key={item.referenceId || index}
              trending={item}
              rank={item.trendRank}
              onPress={onTrendingPress}
            />
          ))}

        {/* Who to Follow Section */}
        {Array.isArray(whoToFollow) && whoToFollow.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('explore.whoToFollow', 'Who to follow')}</Text>
              {onShowMoreUsers && (
                <TouchableOpacity onPress={onShowMoreUsers}>
                  <Text style={styles.showMoreText}>{t('explore.showMore', 'Show more')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {whoToFollow.slice(0, 3).map((user) => {
              const mappedUser = mapExploreUserToUser(user);
              return (
                <UserListItem
                  key={user.id}
                  user={mappedUser}
                  onPress={onUserPress}
                  renderAction={(u) => <FollowButton user={u} />}
                />
              );
            })}
          </>
        )}

        {/* Tweet Categories Section */}
        {Array.isArray(forYouPosts) &&
          forYouPosts.map((categoryData) => (
            <TweetCategorySection
              key={categoryData.category.id}
              category={categoryData}
              onArrowPress={
                onCategoryShowMore
                  ? () => onCategoryShowMore(categoryData.category.id, categoryData.category.name)
                  : undefined
              }
            />
          ))}
      </ScrollView>
      <MediaViewerModal />
    </MediaViewerProvider>
  );
};

export default ForYouContent;

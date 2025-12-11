import AccountIcon from '@/src/components/icons/AccountIcon';
import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SuggestionsProvidedProps } from 'react-native-controlled-mentions';

interface IUserSuggestionsListProps extends SuggestionsProvidedProps {
  users: IUser[];
  onCloseModal: () => void;
}
const UserSuggestionsList: React.FC<IUserSuggestionsListProps> = (props) => {
  const { onSelect, users, onCloseModal, keyword } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createListStyles(theme), [theme]);

  const navigateToSearch = () => {
    onCloseModal();
    router.push({ pathname: '/(protected)/search/search-suggestions', params: { query: keyword } });
  };
  if (users.length === 0) {
    return (
      <Pressable style={styles.emptyContainer} onPress={navigateToSearch}>
        <View style={styles.searchIconContainer}>
          <Search size={theme.iconSizes.md} stroke={theme.colors.white} />
        </View>
        <View>
          <Text style={styles.title}>{t('userList.findWhoYoureLookingFor')}</Text>
          <Text style={styles.subtitle}>{t('userList.searchForPersonToMention')}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <FlashList
      style={styles.container}
      data={users}
      renderItem={({ item }) => <UserSuggestionItem user={item} onSelect={() => onSelect(item)} />}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

export default UserSuggestionsList;

interface IUserSuggestionItemProps {
  user: IUser;
  onSelect: () => void;
}
const UserSuggestionItem: React.FC<IUserSuggestionItemProps> = (props) => {
  const { user, onSelect } = props;

  const { theme } = useTheme();
  const styles = useMemo(() => createItemStyles(theme), [theme]);

  const { t } = useTranslation();
  return (
    <Pressable onPress={onSelect} style={styles.userInfoContainer}>
      <View accessibilityLabel="full_tweet_avatar" testID="full_tweet_avatar">
        <Image
          source={user.avatarUrl ? { uri: user.avatarUrl } : DEFAULT_AVATAR_URL}
          style={styles.avatar}
          accessibilityLabel="full_tweet_image_avatar"
        />
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.name} accessibilityLabel="full_tweet_user_name" testID="full_tweet_user_name">
          {user.name}
        </Text>
        <Text style={styles.username} accessibilityLabel="full_tweet_user_username" testID="full_tweet_user_username">
          @{user.username}
        </Text>
        {(user.isFollowing || user.isFollower) && (
          <View style={styles.followStatus}>
            <AccountIcon size={theme.iconSizes.sm} stroke={theme.colors.text.secondary} strokeWidth={0} />
            <Text
              style={styles.username}
              accessibilityLabel="full_tweet_user_username"
              testID="full_tweet_user_username"
            >
              {user.isFollowing && user.isFollower
                ? t('userList.youFollowEachOther')
                : user.isFollowing
                  ? t('userList.following')
                  : t('userList.followsYou')}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const createListStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      padding: theme.spacing.md,
    },
    separator: {
      height: theme.spacing.xxll,
    },
    emptyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    title: {
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    searchIconContainer: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.accent.bookmark,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

const createItemStyles = (theme: Theme) =>
  StyleSheet.create({
    userInfoContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
    },
    userDetails: {
      gap: 2,
    },
    name: {
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
    },
    username: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    followStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });

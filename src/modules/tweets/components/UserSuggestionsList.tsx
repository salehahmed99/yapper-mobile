import AccountIcon from '@/src/components/icons/AccountIcon';
import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SuggestionsProvidedProps } from 'react-native-controlled-mentions';

const UserSuggestionsList: React.FC<SuggestionsProvidedProps> = (props) => {
  const { keyword, onSelect } = props;
  const dummyUsers: IUser[] = [
    {
      id: '1',
      name: 'David Tabaka',
      username: 'daviddtabaka',
      avatarUrl: 'https://i.pravatar.cc/150?u=1',
      email: 'daviddtabaka@gmail.com',
      isFollowing: true,
      isFollower: true,
    },
    {
      id: '2',
      name: 'Mary',
      username: 'mary',
      avatarUrl: 'https://i.pravatar.cc/150?u=2',
      email: 'mary@gmail.com',
      isFollowing: true,
      isFollower: false,
    },
  ];

  const { theme } = useTheme();
  const styles = useMemo(() => createListStyles(theme), [theme]);
  if (keyword == null) {
    return null;
  }
  return (
    <View style={styles.container}>
      {dummyUsers
        .filter((one) => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
        .map((one) => (
          <UserSuggestionItem key={one.id} user={one} onSelect={() => onSelect(one)} />
        ))}
    </View>
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
            <AccountIcon size={theme.iconSizes.sm} stroke={theme.colors.text.secondary} strokeWidth={0} filled={true} />
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
      gap: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      padding: theme.spacing.md,
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

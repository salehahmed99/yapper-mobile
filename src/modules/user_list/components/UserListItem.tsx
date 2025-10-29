import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { User } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IUserListUser } from '../types';

interface IUserListItemProps {
  user: IUserListUser;
  onPress?: (user: IUserListUser) => void;
  onFollowPress?: (user: IUserListUser) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    followsYouContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.xs,
    },
    followsYouIcon: {
      marginRight: theme.spacing.xs,
    },
    followsYouText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarWrapper: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.avatarSizes.md / 2,
      backgroundColor: theme.colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    avatarImage: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.avatarSizes.md / 2,
    },
    avatarInitial: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    nameAndButtonRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    nameContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    name: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
      marginBottom: theme.spacing.xs / 2,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
    },
    username: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      marginBottom: theme.spacing.xs,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
    },
    bio: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.relaxed,
    },
    actionContainer: {
      justifyContent: 'center',
    },
    followButton: {
      backgroundColor: theme.colors.text.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      minWidth: theme.spacing.xxl * 4,
      height: theme.buttonHeights.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    followingButton: {
      backgroundColor: 'transparent',
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
    },
    followButtonText: {
      color: theme.colors.background.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    followingButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
    },
  });

const getInitial = (name?: string) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

const UserListItem: React.FC<IUserListItemProps> = ({ user, onPress, onFollowPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = () => {
    onPress?.(user);
  };

  const handleFollowPress = (e: any) => {
    e.stopPropagation();
    onFollowPress?.(user);
  };

  const renderAction = () => {
    if (!onFollowPress) return null;

    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.followButton, user.isFollowing && styles.followingButton]}
          onPress={handleFollowPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.followButtonText, user.isFollowing && styles.followingButtonText]}>
            {user.isFollowing ? t('userList.following') : t('userList.follow')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      {user.isFollowed && (
        <View style={styles.followsYouContainer}>
          <User size={theme.iconSizes.xs} color={theme.colors.text.secondary} style={styles.followsYouIcon} />
          <Text style={styles.followsYouText}>{t('userList.followsYou')}</Text>
        </View>
      )}

      <View style={styles.contentRow}>
        <View style={styles.avatarWrapper}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarInitial}>{getInitial(user.name || user.username)}</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameAndButtonRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name || user.username || 'Unknown'}
              </Text>
              {user.username && (
                <Text style={styles.username} numberOfLines={1}>
                  @{user.username}
                </Text>
              )}
            </View>
            {renderAction()}
          </View>
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;

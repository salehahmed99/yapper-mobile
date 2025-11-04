import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useFollowUser } from '@/src/modules/profile/hooks/useFollowUser';
import { IUser } from '@/src/types/user';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface IFollowButtonProps {
  user: IUser;
  onPress?: (user: IUser) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    followButton: {
      backgroundColor: theme.colors.text.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      width: theme.spacing.xxl * 4.5,
      height: theme.buttonHeights.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // eslint-disable-next-line react-native/no-color-literals
    followingButton: {
      backgroundColor: 'transparent',
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
    },
    followButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.sm - 1,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    followingButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
    },
  });

const FollowButton: React.FC<IFollowButtonProps> = ({ user, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use the follow hook
  const { isFollowing, isLoading, toggleFollow, setIsFollowing } = useFollowUser(user.isFollowing || false);

  // Sync with user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing, setIsFollowing]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePress = async (e: any) => {
    e?.stopPropagation?.();

    // Toggle follow status
    await toggleFollow(user.id);

    // Call optional onPress callback
    if (onPress) {
      onPress({ ...user, isFollowing: !isFollowing });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.followButton, isFollowing && styles.followingButton]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? theme.colors.text.primary : theme.colors.text.inverse} />
      ) : (
        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
          {isFollowing ? t('userList.following') : t('userList.follow')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FollowButton;

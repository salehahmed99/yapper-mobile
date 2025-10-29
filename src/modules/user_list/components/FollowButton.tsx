import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface IFollowButtonProps {
  user: IUser;
  onPress: (user: IUser) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    followButton: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      width: theme.spacing.xxl * 4.5,
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
      color: '#000000',
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

  const handlePress = (e: any) => {
    e.stopPropagation();
    onPress(user);
  };

  return (
    <TouchableOpacity
      style={[styles.followButton, user.isFollowing && styles.followingButton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.followButtonText, user.isFollowing && styles.followingButtonText]}>
        {user.isFollowing ? t('userList.following') : t('userList.follow')}
      </Text>
    </TouchableOpacity>
  );
};

export default FollowButton;

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IUserListUser } from '../types';

interface UserListItemProps {
  user: IUserListUser;
  onPress?: (user: IUserListUser) => void;
  rightAction?: React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    },
    avatarWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 24,
    },
    avatarInitial: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.semiBold,
    },
    infoContainer: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    name: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    username: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      marginTop: 2,
    },
    bio: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      marginTop: theme.spacing.xs,
    },
    actionContainer: {
      marginLeft: theme.spacing.md,
    },
  });

const getInitial = (name?: string) => {
  if (!name) {
    return '?';
  }
  return name.charAt(0).toUpperCase();
};

const UserListItem: React.FC<UserListItemProps> = ({ user, onPress, rightAction }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = () => {
    onPress?.(user);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <Text style={styles.avatarInitial}>{getInitial(user.name || user.username)}</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name || user.username || 'Unknown'}
          </Text>
        </View>
        {user.username ? (
          <Text style={styles.username} numberOfLines={1}>
            @{user.username}
          </Text>
        ) : null}
        {user.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        ) : null}
      </View>

      {rightAction ? <View style={styles.actionContainer}>{rightAction}</View> : null}
    </TouchableOpacity>
  );
};

export default UserListItem;

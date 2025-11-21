import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import { User } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IUserListItemProps {
  user: IUser;
  onPress?: (user: IUser) => void;
  renderAction?: (user: IUser) => React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    followsYouContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.avatarSizes.md + theme.spacing.md,
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
      overflow: 'hidden',
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
      alignItems: 'center',
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
      marginBottom: theme.spacing.xs / 4,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    username: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    bio: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.relaxed,
      marginTop: theme.spacing.xs / 2,
    },
    actionContainer: {
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
    },
  });

const getInitial = (name?: string) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

const UserListItem: React.FC<IUserListItemProps> = ({ user, onPress, renderAction }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = () => {
    onPress?.(user);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${user.name || user.username} user profile`}
      accessibilityHint={user.bio ? `${user.bio}` : undefined}
      accessibilityRole="button"
    >
      {user.isFollower && (
        <View
          style={styles.followsYouContainer}
          accessible={true}
          accessibilityLabel="Follows you"
          accessibilityRole="text"
        >
          <User size={theme.iconSizes.xs} color={theme.colors.text.secondary} style={styles.followsYouIcon} />
          <Text style={styles.followsYouText}>{t('userList.followsYou')}</Text>
        </View>
      )}

      <View style={styles.contentRow}>
        <View
          style={styles.avatarWrapper}
          accessible={true}
          accessibilityLabel={`${user.name || user.username} avatar`}
          accessibilityRole="image"
        >
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
            {renderAction && (
              <View
                style={styles.actionContainer}
                accessible={true}
                accessibilityLabel="User action button"
                accessibilityRole="button"
              >
                {renderAction(user)}
              </View>
            )}
          </View>
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2} accessible={true} accessibilityLabel={`Bio: ${user.bio}`}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;

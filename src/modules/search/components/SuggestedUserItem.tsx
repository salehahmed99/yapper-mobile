import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ISuggestedUser } from '../types';

interface ISuggestedUserItemProps {
  user: ISuggestedUser;
  onPress: (userId: string) => void;
}

const SuggestedUserItem: React.FC<ISuggestedUserItemProps> = ({ user, onPress }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(user.userId)}
      accessibilityLabel={`${user.name} @${user.username}`}
      accessibilityRole="button"
      testID={`suggested_user_${user.userId}`}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <Text style={styles.avatarInitial}>{getInitial(user.name || user.username)}</Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          {/* Verified badge could be added here if available in API */}
        </View>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
      </View>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    avatarWrapper: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.avatarSizes.md / 2,
      backgroundColor: theme.colors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatar: {
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
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    name: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
    },
    username: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
    },
  });

export default SuggestedUserItem;

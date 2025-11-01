import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, spacing, typography } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

export type ProfileCardData = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string;
  bio?: string;
  followedBy: string[]; // Array of follower names
};

type ProfileCardProps = {
  profile: ProfileCardData;
  onFollow: (userId: string) => void;
  isFollowing?: boolean;
};

export default function ProfileCard({ profile, onFollow, isFollowing = false }: ProfileCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      width: 300,
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      marginRight: spacing.md,
    },
    banner: {
      width: '100%',
      height: 90,
      backgroundColor: theme.colors.background.tertiary,
    },
    contentContainer: {
      padding: spacing.md,
    },
    avatarContainer: {
      marginTop: -52,
      marginBottom: spacing.sm,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.full,
      borderWidth: 4,
      borderColor: theme.colors.background.primary,
    },
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    nameContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    name: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.bold,
      color: theme.colors.text.primary,
      lineHeight: 20,
      textTransform: 'capitalize',
    },
    username: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: spacing.xs,
      textTransform: 'capitalize',
    },
    bio: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: theme.colors.text.primary,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    followedByContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    followedByIcon: {
      width: 16,
      height: 16,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
      marginRight: 4,
    },
    followedByText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 16,
      flex: 1,
    },
    followButton: {
      backgroundColor: theme.colors.text.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 73,
    },
    followButtonText: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fonts.bold,
      color: theme.colors.text.inverse,
      lineHeight: 16,
    },
    // eslint-disable-next-line react-native/no-color-literals
    followingButton: {
      backgroundColor: 'transparent',
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
    },
    followingButtonText: {
      color: theme.colors.text.primary,
    },
  });

  const getFollowedByText = () => {
    if (profile.followedBy.length === 0) return '';
    if (profile.followedBy.length === 1) return `${t('profile.whoToFollow.followedBy')} ${profile.followedBy[0]}`;
    if (profile.followedBy.length === 2) {
      return `${t('profile.whoToFollow.followedBy')} ${profile.followedBy[0]} ${t('profile.whoToFollow.and')} ${profile.followedBy[1]}`;
    }
    const othersText =
      profile.followedBy.length - 1 === 1 ? t('profile.whoToFollow.other') : t('profile.whoToFollow.others');
    return `${t('profile.whoToFollow.followedBy')} ${profile.followedBy[0]} ${t('profile.whoToFollow.and')} ${profile.followedBy.length - 1} ${othersText}`;
  };

  return (
    <View style={styles.card}>
      {/* Banner Image */}
      <Image source={{ uri: profile.banner || 'https://picsum.photos/600/180' }} style={styles.banner} />

      <View style={styles.contentContainer}>
        {/* Avatar with overlap */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        </View>

        {/* Name and Follow Button Row */}
        <View style={styles.nameRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => onFollow(profile.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? t('profile.following') : t('profile.follow')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username */}
        <Text style={styles.username} numberOfLines={1}>
          @{profile.username}
        </Text>

        {/* Bio */}
        {profile.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {profile.bio}
          </Text>
        )}

        {/* Followed By */}
        {profile.followedBy.length > 0 && (
          <View style={styles.followedByContainer}>
            <View style={styles.followedByIcon} />
            <Text style={styles.followedByText} numberOfLines={1}>
              {getFollowedByText()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

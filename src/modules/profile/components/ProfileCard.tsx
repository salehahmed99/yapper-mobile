import { DEFAULT_BANNER_URL } from '@/src/constants/defaults';
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
  followedBy: string[];
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
    <View style={styles.card} testID={`profile_card_${profile.id}`}>
      {/* Banner Image */}
      <Image
        source={{ uri: profile.banner || DEFAULT_BANNER_URL }}
        style={styles.banner}
        testID={`profile_card_banner_${profile.id}`}
      />

      <View style={styles.contentContainer}>
        {/* Avatar with overlap */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} testID={`profile_card_avatar_${profile.id}`} />
        </View>

        {/* Name and Follow Button Row */}
        <View style={styles.nameRow}>
          <View style={styles.nameContainer}>
            <Text
              style={styles.name}
              numberOfLines={1}
              accessibilityLabel={`profile_card_name_${profile.id}`}
              testID={`profile_card_name_${profile.id}`}
            >
              {profile.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => onFollow(profile.id)}
            activeOpacity={0.7}
            testID={`profile_card_follow_button_${profile.id}`}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? t('profile.following') : t('profile.follow')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username */}
        <Text
          style={styles.username}
          numberOfLines={1}
          accessibilityLabel={`profile_card_username_${profile.id}`}
          testID={`profile_card_username_${profile.id}`}
        >
          @{profile.username}
        </Text>

        {/* Bio */}
        {profile.bio && (
          <Text
            style={styles.bio}
            numberOfLines={2}
            accessibilityLabel={`profile_card_bio_${profile.id}`}
            testID={`profile_card_bio_${profile.id}`}
          >
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

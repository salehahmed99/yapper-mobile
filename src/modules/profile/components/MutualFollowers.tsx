import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useRTL } from '../../../hooks/useRTL';
import { IMutualFollower } from '../types';
import { formatMutualFollowersText } from '../utils/helper-functions.utils';

interface MutualFollowersProps {
  mutualFollowers: IMutualFollower[];
  totalCount: number;
}

const MutualFollowers: React.FC<MutualFollowersProps> = ({ mutualFollowers, totalCount }) => {
  const { theme } = useTheme();
  const isRTL = useRTL();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          marginTop: theme.spacing.sm,
          marginBottom: -theme.spacing.md,
          maxWidth: '100%',
        },
        avatarsContainer: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          flexShrink: 0,
          ...(isRTL ? { marginLeft: theme.spacing.sm } : { marginRight: theme.spacing.sm }),
        },
        avatar: {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.background.primary,
          ...(isRTL ? { marginRight: -6 } : { marginLeft: -6 }),
        },
        firstAvatar: {
          ...(isRTL ? { marginRight: -4 } : { marginLeft: -4 }),
        },
        text: {
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.text.secondary,
          textAlign: isRTL ? 'right' : 'left',
          includeFontPadding: false,
          maxWidth: '90%',
        },
      }),
    [theme, isRTL],
  );

  if (!mutualFollowers || mutualFollowers.length === 0 || totalCount === 0) {
    return null;
  }

  const displayNames = mutualFollowers
    .slice(0, 3)
    .map((follower) => follower.name)
    .filter(Boolean);

  if (displayNames.length === 0) {
    return null;
  }

  const displayText = formatMutualFollowersText(displayNames, totalCount);

  return (
    <View style={styles.container}>
      <View style={styles.avatarsContainer}>
        {mutualFollowers.slice(0, 3).map((follower, index) => (
          <Image
            key={`mutual-follower-${follower.userId}-${index}`}
            source={{ uri: follower.avatarUrl || DEFAULT_AVATAR_URL }}
            style={[styles.avatar, index === 0 && styles.firstAvatar]}
          />
        ))}
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {displayText || 'Followed by mutual connections'}
      </Text>
    </View>
  );
};

export default MutualFollowers;

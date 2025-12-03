import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { IMutualFollower } from '../types';
import { formatMutualFollowersText } from '../utils/helper-functions.utils';

interface MutualFollowersProps {
  mutualFollowers: IMutualFollower[];
  totalCount: number;
}

const MutualFollowers: React.FC<MutualFollowersProps> = ({ mutualFollowers, totalCount }) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: theme.spacing.sm,
          marginBottom: -theme.spacing.md,
        },
        avatarsContainer: {
          flexDirection: 'row',
          marginRight: theme.spacing.sm,
        },
        avatar: {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.background.primary,
          marginLeft: -6,
        },
        firstAvatar: {
          marginLeft: -4,
        },
        text: {
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.text.secondary,
          flex: 1,
        },
      }),
    [theme],
  );

  if (!mutualFollowers || mutualFollowers.length === 0 || totalCount === 0) {
    return null;
  }

  const displayNames = mutualFollowers.slice(0, 3).map((follower) => follower.name);
  const displayText = formatMutualFollowersText(displayNames, totalCount);

  return (
    <View style={styles.container}>
      <View style={styles.avatarsContainer}>
        {mutualFollowers.slice(0, 3).map((follower, index) => (
          <Image
            key={`mutual-follower-${follower.userId}-${index}`}
            source={{ uri: follower.avatarUrl }}
            style={[styles.avatar, index === 0 && styles.firstAvatar]}
          />
        ))}
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {displayText}
      </Text>
    </View>
  );
};

export default MutualFollowers;

import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatCount } from '@/src/utils/formatCount';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IExploreTrending, ITrendItem } from '../types';

interface ITrendingItemProps {
  trending: IExploreTrending | ITrendItem;
  rank?: number;
  onPress?: (trending: IExploreTrending | ITrendItem) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs / 2,
    },
    textContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs / 2,
    },
    trendingRank: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      marginRight: theme.spacing.xs,
      lineHeight: theme.typography.sizes.xs * theme.typography.lineHeights.tight,
    },
    category: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.xs * theme.typography.lineHeights.tight,
    },
    trendingText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
      marginBottom: theme.spacing.xs / 2,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    postCount: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.xs * theme.typography.lineHeights.tight,
    },
  });

const getTrendingText = (trending: IExploreTrending | ITrendItem): string => {
  if ('text' in trending) {
    return trending.text;
  }
  return trending.hashtag;
};

const getPostsCount = (trending: IExploreTrending | ITrendItem): number => {
  return trending.postsCount;
};

const getCategory = (trending: IExploreTrending | ITrendItem): string => {
  return trending.category;
};

const TrendingItem: React.FC<ITrendingItemProps> = ({ trending, rank, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = () => {
    onPress?.(trending);
  };

  const trendingText = getTrendingText(trending);
  const postsCount = getPostsCount(trending);
  const category = getCategory(trending);
  const displayRank = rank || ('trendRank' in trending ? trending.trendRank : undefined);

  const getCategoryLabel = () => {
    if (category === 'none' || !category) {
      return t('explore.trending', 'Trending');
    }
    return t(`explore.trendingIn.${category}`, `Trending in ${category}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <View style={styles.categoryRow}>
            {displayRank && <Text style={styles.trendingRank}>{displayRank}</Text>}
            <Text style={styles.category} numberOfLines={1}>
              {getCategoryLabel()}
            </Text>
          </View>
          <Text style={styles.trendingText} numberOfLines={1}>
            {trendingText}
          </Text>
          <Text style={styles.postCount}>
            {formatCount(postsCount)} {t('explore.posts', 'posts')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TrendingItem;

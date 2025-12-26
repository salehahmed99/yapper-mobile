import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import TweetContainer from '@/src/modules/tweets/containers/TweetContainer';
import { ArrowRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IExploreCategory } from '../types';

interface ITweetCategorySectionProps {
  category: IExploreCategory;
  onArrowPress?: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: theme.borderWidth.thin / 2,
      borderTopColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginRight: theme.spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrowButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    moreButton: {
      padding: theme.spacing.xs,
    },
  });

const TweetCategorySection: React.FC<ITweetCategorySectionProps> = ({ category, onArrowPress }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // API returns tweets in either "tweets" or "posts" array (inconsistent)
  const tweets = category.tweets || category.posts || [];

  if (tweets.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Category Header - entire header is pressable */}
      <TouchableOpacity
        style={styles.header}
        onPress={onArrowPress}
        activeOpacity={onArrowPress ? 0.7 : 1}
        disabled={!onArrowPress}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.categoryTitle}>{category.category.name}</Text>
        </View>
        <View style={styles.headerActions}>
          {onArrowPress && <ArrowRight size={theme.iconSizes.md} color={theme.colors.text.primary} />}
        </View>
      </TouchableOpacity>

      {/* All Tweets using TweetContainer */}
      {tweets.map((tweet) => (
        <TweetContainer key={tweet.tweetId} tweet={tweet} isVisible={false} showThread={false} />
      ))}
    </View>
  );
};

export default TweetCategorySection;

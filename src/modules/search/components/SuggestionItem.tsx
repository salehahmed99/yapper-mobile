import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { ArrowUpLeft } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ISuggestedQuery } from '../types';

interface ISuggestionItemProps {
  suggestion: ISuggestedQuery;
  onPress: (query: string) => void;
  onArrowPress?: (query: string) => void;
}

const SuggestionItem: React.FC<ISuggestionItemProps> = ({ suggestion, onPress, onArrowPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(suggestion.query)}
      accessibilityLabel={`${suggestion.query}${suggestion.isTrending ? t('search.trendingAccessibility', ', Trending') : ''}`}
      accessibilityRole="button"
      testID={`suggestion_item_${suggestion.query}`}
    >
      <View style={styles.textContainer}>
        <Text style={styles.queryText} numberOfLines={1}>
          {suggestion.query}
        </Text>
        {suggestion.isTrending && <Text style={styles.trendingLabel}>{t('search.trending', 'Trending')}</Text>}
      </View>

      {onArrowPress && (
        <Pressable
          onPress={() => onArrowPress(suggestion.query)}
          style={styles.arrowButton}
          accessibilityLabel={t('search.populateQuery', 'Populate search with query')}
          accessibilityRole="button"
          testID={`suggestion_arrow_${suggestion.query}`}
        >
          <ArrowUpLeft size={18} color={theme.colors.text.secondary} />
        </Pressable>
      )}
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
    },
    textContainer: {
      flex: 1,
    },
    queryText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
    },
    trendingLabel: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      marginTop: 2,
    },
    arrowButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default SuggestionItem;

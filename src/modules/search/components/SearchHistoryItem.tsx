import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Clock, X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ISearchHistoryItemProps {
  query: string;
  onPress: (query: string) => void;
  onRemove: (query: string) => void;
}

const SearchHistoryItem: React.FC<ISearchHistoryItemProps> = ({ query, onPress, onRemove }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = () => {
    onPress(query);
  };

  const handleRemove = () => {
    onRemove(query);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Clock size={theme.iconSizes.md} color={theme.colors.text.secondary} />
      </View>
      <Text style={styles.queryText} numberOfLines={1}>
        {query}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    iconContainer: {
      marginRight: theme.spacing.md,
    },
    queryText: {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
    },
    removeButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
  });

export default SearchHistoryItem;

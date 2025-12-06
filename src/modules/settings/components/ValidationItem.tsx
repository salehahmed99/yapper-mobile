import { Theme } from '@/src/constants/theme';
import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';

const ValidationItem: React.FC<{ isValid: boolean; text: string; theme: Theme }> = ({ isValid, text, theme }) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.validationItem}>
      <View
        style={[styles.validationDot, { backgroundColor: isValid ? theme.colors.success : theme.colors.text.tertiary }]}
      />
      <Text style={[styles.validationText, { color: isValid ? theme.colors.success : theme.colors.text.tertiary }]}>
        {text}
      </Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    validationItem: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.xxs },
    validationDot: {
      width: theme.spacing.sm - 2,
      height: theme.spacing.sm - 2,
      borderRadius: theme.borderRadius.sm - 1,
      marginRight: theme.spacing.sm,
    },
    validationText: { fontSize: theme.typography.sizes.tiny },
  });
export default ValidationItem;

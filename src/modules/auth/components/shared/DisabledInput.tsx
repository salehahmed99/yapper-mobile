import React, { useMemo } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface IDisabledInputProps {
  value: string;
}

const DisabledInput: React.FC<IDisabledInputProps> = ({ value }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={value}
        editable={false}
        placeholderTextColor={theme.colors.text.tertiary}
        accessibilityLabel="Auth_input_disabled"
      />
    </View>
  );
};

export default DisabledInput;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    inputContainer: {
      position: 'relative',
      marginBottom: theme.spacing.xxll,
    },
    input: {
      height: 56,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    disabledInput: {
      color: theme.colors.text.secondary,
      backgroundColor: theme.colors.background.secondary,
    },
  });

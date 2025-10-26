import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface IButtonProps {
  text: string;
  isNextEnabled?: boolean;
  onNext?: () => void;
}

const Button: React.FC<IButtonProps> = ({ text, isNextEnabled, onNext }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      onPress={onNext}
      style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
      activeOpacity={0.7}
      disabled={!isNextEnabled}
    >
      <Text style={[styles.nextButtonText, !isNextEnabled && styles.nextButtonTextDisabled]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    nextButton: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.text.primary,
    },
    nextButtonDisabled: {
      backgroundColor: theme.colors.background.secondary,
      opacity: 0.5,
    },
    nextButtonText: {
      color: theme.colors.background.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    nextButtonTextDisabled: {
      color: theme.colors.text.secondary,
    },
  });

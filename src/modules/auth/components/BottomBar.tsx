import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { ButtonOptions } from '../utils/enums';

interface IBottomBarProps {
  text: ButtonOptions;
  isNextEnabled?: boolean;
  onForgotPassword?: () => void;
  onNext?: () => void;
}

const BottomBar: React.FC<IBottomBarProps> = ({
  text = ButtonOptions.NEXT,
  isNextEnabled = false,
  onForgotPassword,
  onNext,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const forgotPasswordPress = () => {
    onForgotPassword?.();
  };

  const NextPress = () => {
    if (isNextEnabled) {
      onNext?.();
    }
  };
  return (
    <View style={styles.container}>
      {/* Thin off-white line above the bar */}
      <View style={styles.topBorder} />

      <View style={styles.content}>
        {/* Forgot Password button on the left */}
        <TouchableOpacity onPress={forgotPasswordPress} style={styles.forgotPasswordButton} activeOpacity={0.7}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Next button on the right */}
        <TouchableOpacity
          onPress={NextPress}
          style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
          activeOpacity={0.7}
          disabled={!isNextEnabled}
        >
          <Text style={[styles.nextButtonText, !isNextEnabled && styles.nextButtonTextDisabled]}>{text}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: theme.colors.background.primary,
    },
    topBorder: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.border,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    forgotPasswordButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.text.primary,
      borderRadius: 20,
      backgroundColor: theme.colors.background.primary,
    },
    forgotPasswordText: {
      color: theme.colors.text.primary,
      fontSize: 15,
      fontWeight: '400',
    },
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

export default BottomBar;

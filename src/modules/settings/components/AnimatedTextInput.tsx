import React, { useRef, useMemo } from 'react';
import { TextInput, Animated, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface AnimatedTextInputProps extends TextInputProps {
  onFocusChange?: (isFocused: boolean) => void;
}

export const AnimatedTextInput: React.FC<AnimatedTextInputProps> = ({ onFocusChange, style, ...props }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (toValue: number) => {
    Animated.timing(borderAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: any) => {
    animateBorder(1);
    onFocusChange?.(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    animateBorder(0);
    onFocusChange?.(false);
    props.onBlur?.(e);
  };

  const getBorderColor = () => {
    return borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.border, theme.colors.text.link],
    });
  };

  return (
    <Animated.View style={[styles.animatedView, { borderBottomColor: getBorderColor() }]}>
      <TextInput {...props} style={[styles.input, style]} onFocus={handleFocus} onBlur={handleBlur} />
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    animatedView: {
      borderBottomWidth: 1,
    },
    input: {
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
    },
  });

import React, { useMemo, useState } from 'react';
import { Animated, TextInput, TouchableOpacity, View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface IPasswordInputProps {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  showCheck?: boolean;
  status?: 'success' | 'error';
  errorMessage?: string;
}

const PasswordInput: React.FC<IPasswordInputProps> = ({
  label,
  value,
  onChangeText,
  onToggleVisibility,
  isVisible = false,
  showCheck = false,
  status,
  errorMessage,
}) => {
  const [focused, setFocused] = useState(false);
  const anim = useState(new Animated.Value(value ? 1 : 0))[0];
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const scaleFonts = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(
    () => createStyles(theme, scaleWidth, scaleHeight, scaleFonts),
    [theme, scaleWidth, scaleHeight, scaleFonts],
  );

  const animateLabel = (toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelColor =
    status === 'error' ? theme.colors.error : focused ? theme.colors.text.link : theme.colors.text.secondary;

  const labelStyle = {
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [20 * scaleHeight, -8 * scaleHeight] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [17 * scaleFonts, 13 * scaleFonts] }),
    color: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.secondary, labelColor],
    }),
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>{label}</Animated.Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, status === 'error' && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
          animateLabel(1);
        }}
        onBlur={() => {
          setFocused(false);
          if (!value) animateLabel(0);
        }}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={theme.colors.text.secondary}
        allowFontScaling={true}
        accessibilityLabel="password_input"
      />

      {value.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={onToggleVisibility}
            accessibilityLabel={isVisible ? 'Hide_password_button' : 'Show_password_button'}
            accessibilityRole="button"
            accessibilityHint={isVisible ? 'Hides password' : 'Shows password'}
          >
            {isVisible ? (
              <EyeOff color={theme.colors.text.secondary} size={20 * scaleFonts} />
            ) : (
              <Eye color={theme.colors.text.secondary} size={20 * scaleFonts} />
            )}
          </TouchableOpacity>

          {showCheck && status === 'success' && (
            <View style={styles.successIcon}>
              <Check color={theme.colors.text.inverse} size={14 * scaleFonts} />
            </View>
          )}

          {showCheck && status === 'error' && (
            <View style={styles.errorIconContainer} accessibilityLabel="Password_invalid">
              <AlertCircle color={theme.colors.error} size={24 * scaleFonts} />
            </View>
          )}
        </>
      )}

      {status === 'error' && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme, scaleWidth: number = 1, scaleHeight: number = 1, scaleFonts: number = 1) =>
  StyleSheet.create({
    inputContainer: {
      position: 'relative',
      marginBottom: theme.spacing.xxll * scaleHeight,
    },
    input: {
      height: 56 * scaleHeight,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg * scaleWidth,
      fontSize: theme.typography.sizes.md * scaleFonts,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: 2,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    floatingLabel: {
      position: 'absolute',
      left: theme.spacing.md * scaleWidth,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.xs * scaleWidth,
      zIndex: 1,
    },
    eyeIcon: {
      position: 'absolute',
      right: theme.spacing.xxxl * scaleWidth,
      top: theme.spacing.lg * scaleHeight,
      paddingHorizontal: theme.spacing.xs * scaleWidth,
      paddingVertical: theme.spacing.xs * scaleHeight,
    },
    successIcon: {
      position: 'absolute',
      right: theme.spacing.md * scaleWidth,
      top: theme.spacing.xl * scaleHeight,
      width: 20 * scaleWidth,
      height: 20 * scaleHeight,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorIconContainer: {
      position: 'absolute',
      right: theme.spacing.md * scaleWidth,
      top: theme.spacing.lg * scaleHeight,
      paddingHorizontal: theme.spacing.xs * scaleWidth,
      paddingVertical: theme.spacing.xs * scaleHeight,
    },
    errorText: {
      marginTop: theme.spacing.xs * scaleHeight,
      fontSize: theme.typography.sizes.xs * scaleFonts,
      color: theme.colors.error,
    },
  });

export default PasswordInput;

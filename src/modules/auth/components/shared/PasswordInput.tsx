import React, { useMemo, useState } from 'react';
import { Animated, TextInput, TouchableOpacity, View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Eye, EyeOff, Check, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface IPasswordInputProps {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  showCheck?: boolean; // show status icon
  status?: 'success' | 'warning'; // status of input
  errorMessage?: string; // optional error message
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
  const { width } = useWindowDimensions();

  const scaleFactor = Math.min(Math.max(width / 390, 0.85), 1.1);
  const styles = useMemo(() => createStyles(theme, scaleFactor), [theme, scaleFactor]);

  const animateLabel = (toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [20 * scaleFactor, -8 * scaleFactor] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [17, 13] }),
    color: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.secondary, focused ? theme.colors.text.link : theme.colors.text.secondary],
    }),
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>{label}</Animated.Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
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
      />

      {value.length > 0 && (
        <>
          <TouchableOpacity style={styles.eyeIcon} onPress={onToggleVisibility}>
            {isVisible ? (
              <EyeOff color={theme.colors.text.secondary} size={20} />
            ) : (
              <Eye color={theme.colors.text.secondary} size={20} />
            )}
          </TouchableOpacity>

          {showCheck && status && (
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: status === 'success' ? theme.colors.success : theme.colors.warning },
              ]}
            >
              {status === 'success' ? (
                <Check color={theme.colors.text.inverse} size={14} />
              ) : (
                <AlertTriangle color={theme.colors.text.inverse} size={14} />
              )}
            </View>
          )}
        </>
      )}

      {status === 'warning' && errorMessage && (
        <Text style={[styles.errorText, { color: theme.colors.warning }]}>{errorMessage}</Text>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, scaleFactor: number = 1) =>
  StyleSheet.create({
    inputContainer: {
      position: 'relative',
      marginBottom: theme.spacing.xxll * scaleFactor,
    },
    input: {
      height: 56 * scaleFactor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg * scaleFactor,
      fontSize: theme.typography.sizes.md * scaleFactor,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: 2,
    },
    floatingLabel: {
      position: 'absolute',
      left: theme.spacing.md * scaleFactor,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.xs * scaleFactor,
      zIndex: 1,
    },
    eyeIcon: {
      position: 'absolute',
      right: theme.spacing.xxxl * scaleFactor,
      top: theme.spacing.lg * scaleFactor,
      padding: theme.spacing.xs * scaleFactor,
    },
    statusIcon: {
      position: 'absolute',
      right: theme.spacing.md * scaleFactor,
      top: theme.spacing.xl * scaleFactor,
      width: 20 * scaleFactor,
      height: 20 * scaleFactor,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      marginTop: theme.spacing.xs * scaleFactor,
      fontSize: theme.typography.sizes.xs * scaleFactor,
    },
  });

export default PasswordInput;

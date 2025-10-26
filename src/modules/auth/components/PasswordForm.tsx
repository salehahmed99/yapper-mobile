import { Check, Eye, EyeOff } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

interface ISecondPageLoginProps {
  userIdentifier: string;
  password: string;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const PasswordForm: React.FC<ISecondPageLoginProps> = ({
  userIdentifier,
  password,
  onPasswordChange,
  onTogglePasswordVisibility,
  isPasswordVisible = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [passwordInputFocused, setPasswordInputFocused] = useState(false);
  const passwordInputLabelAnimation = useState(new Animated.Value(password ? 1 : 0))[0];

  const handlePasswordFocus = () => {
    setPasswordInputFocused(true);
    Animated.timing(passwordInputLabelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    setPasswordInputFocused(false);
    if (!password) {
      Animated.timing(passwordInputLabelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -8],
  });

  const labelFontSize = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [17, 13],
  });

  const labelColor = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.text.secondary,
      passwordInputFocused ? theme.colors.text.link : theme.colors.text.secondary,
    ],
  });

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.passwordTitle')}</Text>

      {/* Disabled User Identifier Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={userIdentifier}
          editable={false}
          placeholderTextColor={theme.colors.text.secondary}
        />
      </View>

      {/* Password Input with Floating Label */}
      <View style={styles.inputContainer}>
        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
            },
          ]}
        >
          {t('auth.login.passwordLabel')}
        </Animated.Text>
        <TextInput
          style={[styles.input, passwordInputFocused && styles.inputFocused]}
          value={password}
          onChangeText={onPasswordChange}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          placeholderTextColor={theme.colors.text.secondary}
        />
        {password.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={onTogglePasswordVisibility}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? (
                <EyeOff color={theme.colors.text.secondary} size={20} />
              ) : (
                <Eye color={theme.colors.text.secondary} size={20} />
              )}
            </TouchableOpacity>
            {password.length >= 8 && (
              <View style={styles.statusIcon} accessibilityLabel="Valid password">
                <Check color={theme.colors.text.inverse} size={14} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: 15,
      paddingTop: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text.primary,
      lineHeight: 36,
      letterSpacing: -0.3,
      marginBottom: 32,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 24,
    },
    input: {
      height: 56,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 4,
      paddingHorizontal: 16,
      fontSize: 17,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: 2,
    },
    disabledInput: {
      color: theme.colors.text.secondary,
      backgroundColor: theme.colors.background.secondary,
    },
    floatingLabel: {
      position: 'absolute',
      left: 12,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: 4,
      zIndex: 1,
    },
    eyeIcon: {
      position: 'absolute',
      right: 40,
      top: 16,
      padding: 4,
    },
    statusIcon: {
      position: 'absolute',
      right: 12,
      top: 20,
      width: 20,
      height: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default PasswordForm;

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import React from 'react';

interface IEmailFormProps {
  text: string;
  onTextChange: (text: string) => void;
}

const EmailForm: React.FC<IEmailFormProps> = ({ text, onTextChange }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;

  const shouldFloat = isFocused || text.length > 0;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: shouldFloat ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [shouldFloat, labelPosition]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 16,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 13],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.secondary, isFocused ? theme.colors.text.link : theme.colors.text.secondary],
    }),
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.emailTitle')}</Text>

      <View style={styles.inputContainer}>
        <Animated.Text style={labelStyle}>{t('auth.login.emailLabel')}</Animated.Text>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          value={text}
          onChangeText={onTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          accessibilityLabel="user-identifier-input"
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.mdg,
      paddingTop: theme.spacing.xxl,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 36,
      marginBottom: theme.spacing.xl,
      letterSpacing: -0.3,
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    input: {
      height: 56,
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.borderInverse,
      borderWidth: 1,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      width: '100%',
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: 2,
    },
  });

export default EmailForm;

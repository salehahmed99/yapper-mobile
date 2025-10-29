import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import { useTranslation } from 'react-i18next';

export default function SuccessScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  // Responsive scale factor
  const scaleFactor = Math.min(Math.max(width / 390, 0.85), 1.1);

  const styles = useMemo(() => createStyles(theme, scaleFactor), [theme, scaleFactor]);

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>You&apos;re all set</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {t('auth.forgotPassword.successDescription')}.{'\n\n'}
        {t('auth.forgotPassword.twoFactorPrefix')}{' '}
        <Text style={styles.link} onPress={() => Linking.openURL('https://twitter.com/settings/security')}>
          {t('auth.forgotPassword.twoFactorLink')}
        </Text>
        . {t('auth.forgotPassword.twoFactorSuffix')}
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{t('auth.forgotPassword.continueButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme, scaleFactor: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.xl * scaleFactor,
      paddingTop: (theme.spacing.xxl * 2 + theme.spacing.lg) * scaleFactor,
      justifyContent: 'flex-start',
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: (theme.typography.sizes.xxl + 1) * scaleFactor,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 40 * scaleFactor,
      marginBottom: theme.spacing.xxl * scaleFactor,
      letterSpacing: -0.3,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: (theme.typography.sizes.lg - 3) * scaleFactor,
      lineHeight: 20 * scaleFactor,
      marginBottom: (theme.spacing.xxl * 2 + theme.spacing.lg) * scaleFactor,
      textAlign: 'left',
    },
    link: {
      color: theme.colors.text.link,
    },
    button: {
      backgroundColor: theme.colors.text.inverse,
      paddingVertical: theme.spacing.md * scaleFactor,
      paddingHorizontal: theme.spacing.xxl * scaleFactor,
      borderRadius: theme.borderRadius.full,
      width: '100%',
      marginTop: theme.spacing.xl * scaleFactor,
    },
    buttonText: {
      color: theme.colors.background.primary,
      fontSize: theme.typography.sizes.md * scaleFactor,
      fontFamily: theme.typography.fonts.bold,
      textAlign: 'center',
    },
  });

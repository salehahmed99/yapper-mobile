import React, { useMemo } from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface IOAuthButtonProps {
  onGooglePress?: () => void;
  onGithubPress?: () => void;
  onCreateAccountPress?: () => void;
}

const OAuthButtons: React.FC<IOAuthButtonProps> = ({ onGooglePress, onGithubPress, onCreateAccountPress }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  return (
    <>
      <Pressable onPress={onGooglePress} style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}>
        <View style={styles.buttonContent}>
          <Image
            source={require('@/assets/images/google.png')}
            style={styles.buttonLogo}
            accessibilityLabel={t('auth.oauth.accessibility.googleLogo')}
          />

          <Text style={styles.pillButtonLabelDark}>{t('auth.oauth.buttons.continueWithGoogle')}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onGithubPress} style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}>
        <View style={styles.buttonContent}>
          <Image
            source={require('@/assets/images/Github-Logo.png')}
            style={styles.buttonLogo}
            accessibilityLabel={t('auth.oauth.accessibility.githubLogo')}
          />

          <Text style={styles.pillButtonLabelDark}>{t('auth.oauth.buttons.continueWithGithub')}</Text>
        </View>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t('auth.oauth.dividerText')}</Text>
        <View style={styles.divider} />
      </View>

      <Pressable
        onPress={onCreateAccountPress}
        style={({ pressed }) => [styles.pillButtonCreate, pressed && styles.pressed]}
      >
        <Text style={styles.pillButtonLabelDarkCreate}>{t('auth.oauth.buttons.createAccount')}</Text>
      </Pressable>
    </>
  );
};

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    pillButton: {
      height: 50,
      borderRadius: theme.borderRadius.full,
      backgroundColor: isDark ? theme.colors.background.inverse : theme.colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pillButtonCreate: {
      height: 50,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.inverse,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    pressed: { opacity: 0.9 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    buttonLogo: { width: 30, height: 30, resizeMode: 'contain' },
    pillButtonLabelDark: {
      color: isDark ? theme.colors.text.inverse : theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    pillButtonLabelDarkCreate: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    divider: { flex: 1, height: 1, backgroundColor: theme.colors.border },
    dividerText: {
      color: theme.colors.text.tertiary,
      marginHorizontal: theme.spacing.md,
      fontSize: theme.typography.sizes.sm,
    },
  });

export default OAuthButtons;

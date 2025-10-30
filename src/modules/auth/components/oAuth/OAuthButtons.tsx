import React from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@/src/constants/theme';

interface IOAuthButtonProps {
  theme: Theme;
  onGooglePress?: () => void;
  onGithubPress?: () => void;
  onCreateAccountPress?: () => void;
}

const OAuthButtons: React.FC<IOAuthButtonProps> = ({ theme, onGooglePress, onGithubPress, onCreateAccountPress }) => {
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <>
      <Pressable onPress={onGooglePress} style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}>
        <View style={styles.buttonContent}>
          <Image
            source={require('../../../../../assets/images/google.png')}
            style={styles.buttonLogo}
            accessibilityLabel={t('auth.oauth.accessibility.googleLogo')}
          />

          <Text style={styles.pillButtonLabelDark}>{t('auth.oauth.buttons.continueWithGoogle')}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onGithubPress} style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}>
        <View style={styles.buttonContent}>
          <Image
            source={require('../../../../../assets/images/Github-Logo.png')}
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

      <Pressable onPress={onCreateAccountPress} style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}>
        <Text style={styles.pillButtonLabelDark}>{t('auth.oauth.buttons.createAccount')}</Text>
      </Pressable>
    </>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pillButton: {
      height: 50,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.inverse,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    pressed: { opacity: 0.9 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    buttonLogo: { width: 30, height: 30, resizeMode: 'contain' },
    pillButtonLabelDark: {
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

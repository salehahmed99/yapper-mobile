import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@/src/constants/theme';

interface OAuthLegalTextProps {
  theme: Theme;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
  onCookiePress?: () => void;
  onLoginPress?: () => void;
}

const OAuthLegalText: React.FC<OAuthLegalTextProps> = ({
  theme,
  onTermsPress,
  onPrivacyPress,
  onCookiePress,
  onLoginPress,
}) => {
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <>
      <Text style={styles.legalText}>
        {t('auth.oauth.legalText')}{' '}
        <Text
          style={styles.link}
          onPress={onTermsPress}
          accessibilityLabel="legal_terms_link"
          testID="legal_terms_link"
        >
          {t('auth.oauth.terms')}
        </Text>
        ,{' '}
        <Text
          style={styles.link}
          onPress={onPrivacyPress}
          accessibilityLabel="legal_privacy_link"
          testID="legal_privacy_link"
        >
          {t('auth.oauth.privacyPolicy')}
        </Text>
        ,{' '}
        <Text
          style={styles.link}
          onPress={onCookiePress}
          accessibilityLabel="legal_cookie_link"
          testID="legal_cookie_link"
        >
          {t('auth.oauth.cookieUse')}
        </Text>
        .
      </Text>

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>{t('auth.oauth.loginPrompt')} </Text>
        <Pressable onPress={onLoginPress} testID="login-link" accessibilityLabel="login-link" accessibilityRole="link">
          <Text style={styles.link}>{t('auth.oauth.login')}</Text>
        </Pressable>
      </View>
    </>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    legalText: {
      color: theme.colors.text.tertiary,
      fontSize: theme.typography.sizes.xs,
      lineHeight: 18,
      marginTop: theme.spacing.sm,
    },
    link: { color: theme.colors.text.link },
    loginRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.xs,
    },
    loginText: {
      color: theme.colors.text.tertiary,
      fontSize: theme.typography.sizes.sm,
    },
  });

export default OAuthLegalText;

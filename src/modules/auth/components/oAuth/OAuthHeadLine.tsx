import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@/src/constants/theme';

interface IOAuthHeadLineProps {
  theme: Theme;
}

const OAuthHeadLine: React.FC<IOAuthHeadLineProps> = ({ theme }) => {
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../../../../assets/images/yapper.png')}
          style={styles.logo}
          accessibilityLabel={t('auth.oauth.accessibility.logo')}
        />
      </View>
      <View style={styles.middle}>
        <Text style={styles.headline}>{t('auth.oauth.headline')}</Text>
      </View>
    </>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    logoWrap: {
      alignItems: 'center',
    },
    logo: { width: 90, height: 90, resizeMode: 'contain' },
    middle: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
    },
    headline: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xxxl,
      lineHeight: 40,
      fontFamily: theme.typography.fonts.semiBold,
      textAlign: 'left',
    },
  });

export default OAuthHeadLine;

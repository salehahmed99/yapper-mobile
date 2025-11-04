import React, { useMemo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

const OAuthHeadLine: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <View style={styles.logoContainer}>
        <Image
          source={isDark ? require('@/assets/images/Yapper-Black.png') : require('@/assets/images/Yapper-White.png')}
          style={styles.logo}
          resizeMode="contain"
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
    logo: { width: 30, height: 30, resizeMode: 'contain' },
    middle: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
    },
    logoContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
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

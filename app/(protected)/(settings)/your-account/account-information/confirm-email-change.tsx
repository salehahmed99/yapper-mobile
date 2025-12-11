import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { verifyChangeEmail } from '@/src/modules/settings/services/yourAccountService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const ConfirmEmailChangeScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyEnabled, setIsVerifyEnabled] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.back();
    }
  }, [email]);

  useEffect(() => {
    setIsVerifyEnabled(code.trim().length === 6);
  }, [code]);

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      Toast.show({
        type: 'error',
        text1: t('settings.email_verify.invalid_code_title'),
        text2: t('settings.email_verify.invalid_code_message'),
      });
      return;
    }

    setIsLoading(true);
    setIsVerifyEnabled(false);
    try {
      const isVerified = await verifyChangeEmail(code, email);

      if (isVerified) {
        Toast.show({
          type: 'success',
          text1: t('settings.email_verify.verified'),
          text2: t('settings.email_verify.verified_message'),
        });
        router.back();
        router.back();
        router.back();
      } else {
        Toast.show({
          type: 'error',
          text1: t('settings.email_verify.incorrect_title'),
          text2: t('settings.email_verify.incorrect_message'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('settings.email_verify.failed_title');
      Toast.show({ type: 'error', text1: t('settings.email_verify.failed_title'), text2: message });
    } finally {
      setIsVerifyEnabled(true);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <ActivityLoader
        visible={isLoading}
        message={isLoading ? t('settings.common.verifying') : t('settings.common.resending')}
      />
      <TopBar onBackPress={handleBack} showExitButton={false} />
      <View style={styles.content}>
        <AuthTitle title={t('settings.email_verify.title')} />
        <Text style={styles.description}>{t('settings.email_verify.description', { email })}</Text>
        <AuthInput
          description={t('settings.email_verify.sent_to', { email })}
          label={t('settings.email_verify.label')}
          value={code}
          onChange={setCode}
        />
      </View>
      <BottomBar
        rightButton={{
          label: t('settings.common.verify'),
          onPress: handleVerify,
          enabled: isVerifyEnabled,
          visible: true,
          type: 'primary',
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
      paddingHorizontal: theme.spacing.mdg,
    },
  });

export default ConfirmEmailChangeScreen;

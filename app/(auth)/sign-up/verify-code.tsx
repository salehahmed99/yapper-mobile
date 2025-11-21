import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { resendVerificationCode, verifySignUpOTP } from '@/src/modules/auth/services/signUpService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const VerifyCodeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const setVerificationToken = useSignUpStore((state) => state.setVerificationToken);
  const setUserNames = useSignUpStore((state) => state.setUserNames);

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Redirect if no email (user shouldn't be here)
  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email]);

  useEffect(() => {
    setIsNextEnabled(code.trim().length === 6);
  }, [code]);

  const handleNext = async () => {
    if (code.trim().length !== 6) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.verifyCode.errors.invalidCode'),
        text2: t('auth.signUp.verifyCode.errors.sixDigit'),
      });
      return;
    }

    setIsLoading(true);
    setIsNextEnabled(false);
    try {
      const res = await verifySignUpOTP({ email, token: code });

      if (res.data.isVerified) {
        Toast.show({
          type: 'success',
          text1: t('auth.signUp.verifyCode.success.codeVerified'),
          text2: t('auth.signUp.verifyCode.success.emailVerified'),
        });
        setVerificationToken(code);
        setUserNames(res.data.recommendations || []);
        router.push('/(auth)/sign-up/enter-password');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.signUp.verifyCode.errors.invalidCode'),
          text2: res.message || t('auth.signUp.verifyCode.errors.incorrectCode'),
        });
        setVerificationToken('');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.signUp.verifyCode.errors.generic');
      Toast.show({ type: 'error', text1: t('auth.signUp.verifyCode.errors.verificationFailed'), text2: message });
    } finally {
      setIsNextEnabled(true);
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const isEmailSent = await resendVerificationCode({ email });

      if (isEmailSent) {
        Toast.show({
          type: 'success',
          text1: t('auth.signUp.verifyCode.success.codeResent'),
          text2: t('auth.signUp.verifyCode.success.newCodeSent'),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.signUp.verifyCode.errors.resendFailed'),
          text2: t('auth.signUp.verifyCode.errors.tryAgain'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.signUp.verifyCode.errors.generic');
      Toast.show({ type: 'error', text1: t('auth.signUp.verifyCode.errors.error'), text2: message });
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    router.replace('/(auth)/sign-up/create-account-screen');
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };

  return (
    <View style={styles.container}>
      <ActivityLoader
        visible={isLoading || isResending}
        message={isLoading ? t('auth.signUp.verifyCode.verifying') : t('auth.signUp.verifyCode.resending')}
      />
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <AuthTitle title={t('auth.signUp.verifyCode.title')} />
        <Text style={styles.description}>{t('auth.signUp.verifyCode.emailSent')}</Text>
        <AuthInputScreen
          description={t('auth.signUp.verifyCode.description', { email })}
          label={t('auth.signUp.verifyCode.label')}
          value={code}
          onChange={setCode}
        />
        <Pressable
          onPress={handleResendCode}
          disabled={isResending}
          style={styles.resendContainer}
          accessibilityLabel="resend-code-button"
          accessibilityRole="button"
        >
          <Text style={styles.resendText}>{t('auth.signUp.verifyCode.resendText')}</Text>
        </Pressable>
      </View>
      <BottomBar
        rightButton={{
          label: t('buttons.next'),
          onPress: handleNext,
          enabled: isNextEnabled,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: t('buttons.back'),
          onPress: handleBack,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
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
    resendContainer: {
      paddingHorizontal: theme.spacing.mdg,
      paddingTop: theme.spacing.md,
    },
    resendText: {
      color: theme.colors.text.link,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
    },
  });

export default VerifyCodeScreen;

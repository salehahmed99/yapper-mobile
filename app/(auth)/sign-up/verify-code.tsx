import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { resendVerificationCode, verifySignUpOTP } from '@/src/modules/auth/services/signUpService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

const VerifyCodeScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const setverficationToken = useSignUpStore((state) => state.setVerificationToken);
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
        text1: 'Invalid code',
        text2: 'Please enter a 6-digit verification code.',
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
          text1: 'Code verified',
          text2: 'Your email has been verified successfully.',
        });
        setverficationToken(code);
        setUserNames(res.data.recommendations || []);
        router.push('/(auth)/sign-up/enter-password');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid code',
          text2: res.message || 'The verification code you entered is incorrect.',
        });
        setverficationToken('');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Toast.show({ type: 'error', text1: 'Verification failed', text2: message });
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
          text1: 'Code resent',
          text2: 'A new verification code has been sent to your email.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to resend',
          text2: 'Please try again.',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
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
        message={isLoading ? 'Verifying code...' : 'Resending code...'}
      />
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <AuthTitle title="We sent you a code" />
        <AuthInputScreen
          description={`Enter it below to verify ${email}.`}
          label="Verification code"
          value={code}
          onChange={setCode}
        />
        <Pressable onPress={handleResendCode} disabled={isResending} style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive email?</Text>
        </Pressable>
      </View>
      <BottomBar
        rightButton={{
          label: ButtonOptions.NEXT,
          onPress: handleNext,
          enabled: isNextEnabled,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: ButtonOptions.BACK,
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

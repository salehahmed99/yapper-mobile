import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyOTP } from '@/src/modules/auth/services/forgetPasswordService';
import { resendVerificationCode } from '@/src/modules/auth/services/signUpService';

const ConfirmEmailChangeScreen = () => {
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
        text1: 'Invalid Code',
        text2: 'Please enter a 6-digit verification code',
      });
      return;
    }

    setIsLoading(true);
    setIsVerifyEnabled(false);
    try {
      const isVerified = await verifyOTP({ identifier: email, token: code });

      if (isVerified) {
        Toast.show({
          type: 'success',
          text1: 'Email Verified',
          text2: 'Your email has been successfully updated',
        });
        router.back();
        router.back();
        router.back();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid Code',
          text2: 'The verification code you entered is incorrect',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to verify code';
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: message });
    } finally {
      setIsVerifyEnabled(true);
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await resendVerificationCode({ email });

      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: 'A new verification code has been sent to your email',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resend code';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <ActivityLoader visible={isLoading || isResending} message={isLoading ? 'Verifying...' : 'Resending...'} />
      <TopBar onBackPress={handleBack} showExitButton={false} />
      <View style={styles.content}>
        <AuthTitle title="We sent you a code" />
        <Text style={styles.description}>Enter it below to verify {email}</Text>
        <AuthInput description={`Sent to ${email}`} label="Verification code" value={code} onChange={setCode} />
        <Pressable
          onPress={handleResendCode}
          disabled={isResending}
          style={styles.resendContainer}
          accessibilityLabel="resend-code-button"
          accessibilityRole="button"
        >
          <Text style={styles.resendText}>Didn't receive email?</Text>
        </Pressable>
      </View>
      <BottomBar
        rightButton={{
          label: 'Verify',
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

export default ConfirmEmailChangeScreen;

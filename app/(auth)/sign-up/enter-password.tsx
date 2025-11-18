import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import PasswordInput from '@/src/modules/auth/components/shared/PasswordInput';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { passwordSchema } from '@/src/modules/auth/schemas/schemas';
import { signUpStep3 } from '@/src/modules/auth/services/signUpService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const EnterPasswordScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const verificationToken = useSignUpStore((state) => state.verificationToken);
  const userNames = useSignUpStore((state) => state.userNames);

  const loginUser = useAuthStore((state) => state.loginUser);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no email or verification token
  useEffect(() => {
    if (!email || !verificationToken) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, verificationToken]);

  // Validation
  const isPasswordValid = password.length >= 8 ? passwordSchema.safeParse(password).success : true;
  const isFormValid = password.length >= 8 && isPasswordValid && !isLoading;

  const onNextPress = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.enterPassword.errors.invalidPassword'),
        text2: t('auth.signUp.enterPassword.errors.passwordRequirements'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await signUpStep3({
        email,
        password,
        username: userNames[0] || '',
        language: 'en',
      });
      setSkipRedirect(true);
      await loginUser(response.data.user, response.data.accessToken);

      Toast.show({
        type: 'success',
        text1: t('auth.signUp.enterPassword.success.accountCreated'),
        text2: t('auth.signUp.enterPassword.success.accountCreatedDesc'),
      });

      // Navigate to next step or home
      router.replace('/(auth)/sign-up/upload-photo');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.signUp.enterPassword.errors.generic');
      Toast.show({ type: 'error', text1: t('auth.signUp.enterPassword.errors.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={false} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <AuthTitle title={t('auth.signUp.enterPassword.title')} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{t('auth.signUp.enterPassword.description')}</Text>
          </View>

          <View style={styles.inputContainer}>
            <PasswordInput
              label={t('auth.signUp.enterPassword.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              isVisible={isPasswordVisible}
              showCheck={password.length >= 8}
              status={password.length >= 8 && !isPasswordValid ? 'error' : password.length >= 8 ? 'success' : undefined}
              errorMessage={
                password.length >= 8 && !isPasswordValid ? t('auth.signUp.enterPassword.passwordError') : ''
              }
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('auth.signUp.enterPassword.termsPrefix')}{' '}
              <Text style={styles.linkText}>{t('auth.signUp.enterPassword.termsOfService')}</Text>{' '}
              {t('auth.signUp.enterPassword.and')}{' '}
              <Text style={styles.linkText}>{t('auth.signUp.enterPassword.privacyPolicy')}</Text>,{' '}
              {t('auth.signUp.enterPassword.including')}{' '}
              <Text style={styles.linkText}>{t('auth.signUp.enterPassword.cookieUse')}</Text>.{' '}
              {t('auth.signUp.enterPassword.termsDescription')}{' '}
              <Text style={styles.linkText}>{t('auth.signUp.enterPassword.learnMore')}</Text>.{' '}
              {t('auth.signUp.enterPassword.findableText')}{' '}
              <Text style={styles.linkText}>{t('auth.signUp.enterPassword.here')}</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomBar
        rightButton={{
          label: t('auth.signUp.enterPassword.signUpButton'),
          onPress: onNextPress,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
      />
    </View>
  );
};

export default EnterPasswordScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
    },
    titleContainer: {
      marginBottom: theme.spacing.md,
    },
    descriptionContainer: {
      marginBottom: theme.spacing.xl,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: theme.spacing.xl,
    },
    termsContainer: {
      marginTop: theme.spacing.lg,
    },
    termsText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 16,
    },
    linkText: {
      color: theme.colors.text.link,
    },
  });

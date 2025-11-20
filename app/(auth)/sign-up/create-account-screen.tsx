import ActivityLoader from '@/src/components/ActivityLoader';
import ReCaptcha, { ReCaptchaRef } from '@/src/components/ReCaptcha';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { emailSchema, userBirthDateSchema } from '@/src/modules/auth/schemas/schemas';
import { signUpStep1 } from '@/src/modules/auth/services/signUpService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { router } from 'expo-router';
import React, { useMemo, useState, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const CreateAccountScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  // Zustand store
  const setStoreName = useSignUpStore((state) => state.setName);
  const setStoreEmail = useSignUpStore((state) => state.setEmail);
  const setStoreDateOfBirth = useSignUpStore((state) => state.setDateOfBirth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setCaptchaToken] = useState('');

  const [isValidName, setIsValidName] = useState(true);

  // Validation states
  const isEmailValid = email.length >= 2 ? emailSchema.safeParse(email).success : true;
  const isBirthDateValid = dateOfBirth.length > 0 ? userBirthDateSchema.safeParse(dateOfBirth).success : true;

  const onBackPress = () => {
    router.back();
  };

  const onchangeName = (text: string) => {
    setName(text);
    setIsValidName(text.trim().length <= 50 ? true : false);
  };

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isEmailValid &&
    dateOfBirth.length > 0 &&
    isBirthDateValid &&
    !isLoading;

  const onNextPress = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.createAccount.errors.fillAllFields'),
      });
      return;
    }

    // Open reCAPTCHA for verification
    recaptchaRef.current?.open();
  };

  const handleCaptchaVerify = async (token: string) => {
    setCaptchaToken(token);
    setIsLoading(true);

    try {
      const isEmailSent = await signUpStep1({
        email,
        name,
        birth_date: dateOfBirth,
        captcha_token: token,
      });

      if (isEmailSent) {
        // Save to store
        setStoreName(name);
        setStoreEmail(email);
        setStoreDateOfBirth(dateOfBirth);

        Toast.show({
          type: 'success',
          text1: t('auth.signUp.createAccount.success.codeSent'),
          text2: t('auth.signUp.createAccount.success.checkEmail'),
        });
        router.push('/(auth)/sign-up/verify-code');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.signUp.createAccount.errors.failedToSend'),
          text2: t('auth.signUp.createAccount.errors.tryAgain'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.signUp.createAccount.errors.generic');
      Toast.show({ type: 'error', text1: t('auth.signUp.createAccount.errors.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaError = (error: string) => {
    Toast.show({
      type: 'error',
      text1: t('auth.signUp.createAccount.errors.error'),
      text2: error,
    });
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken('');
    Toast.show({
      type: 'info',
      text1: t('auth.signUp.createAccount.captcha.expired'),
      text2: t('auth.signUp.createAccount.captcha.tryAgain'),
    });
  };

  return (
    <View style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={true} onBackPress={onBackPress} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.title}>
            <AuthTitle title={t('auth.signUp.createAccount.title')} />
          </View>

          <AuthInput
            description=""
            label={t('auth.signUp.createAccount.nameLabel')}
            value={name}
            onChange={onchangeName}
            type="text"
            status="success"
            showCheck={isValidName && name.length > 0}
            errorMessage={t('auth.signUp.createAccount.nameError', { count: name.length })}
          />

          <AuthInput
            description=""
            label={t('auth.signUp.createAccount.emailLabel')}
            value={email}
            onChange={setEmail}
            type="text"
            status={email.length >= 2 && !isEmailValid ? 'error' : 'success'}
            showCheck={email.length >= 2 && isEmailValid}
            errorMessage={email.length >= 2 && !isEmailValid ? t('auth.signUp.createAccount.emailError') : ''}
          />

          <AuthInput
            description={t('auth.signUp.createAccount.dateOfBirthDescription')}
            label={t('auth.signUp.createAccount.dateOfBirthLabel')}
            value={dateOfBirth}
            onChange={setDateOfBirth}
            type="date"
            status={dateOfBirth.length > 0 && !isBirthDateValid ? 'error' : 'success'}
            showCheck={dateOfBirth.length > 0}
            errorMessage={
              dateOfBirth.length > 0 && !isBirthDateValid ? t('auth.signUp.createAccount.dateOfBirthError') : ''
            }
            showDescription={true}
          />
        </View>
      </ScrollView>

      <BottomBar
        rightButton={{
          label: t('buttons.next'),
          onPress: onNextPress,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
      />

      <ReCaptcha
        ref={recaptchaRef}
        siteKey={process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        onVerify={handleCaptchaVerify}
        onError={handleCaptchaError}
        onExpire={handleCaptchaExpire}
        size="normal"
        theme={theme.colors.background.primary === '#000000' ? 'dark' : 'light'}
        lang="en"
        themeColors={theme}
      />
    </View>
  );
};

export default CreateAccountScreen;

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
    title: {
      marginBottom: theme.spacing.xxxl * 3,
    },
  });

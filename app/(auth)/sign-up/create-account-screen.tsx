import ActivityLoader from '@/src/components/ActivityLoader';
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
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

const CreateAccountScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const setStoreName = useSignUpStore((state) => state.setName);
  const setStoreEmail = useSignUpStore((state) => state.setEmail);
  const setStoreDateOfBirth = useSignUpStore((state) => state.setDateOfBirth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        text1: 'Please fill all fields correctly before proceeding.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const isEmailSent = await signUpStep1({
        email,
        name,
        birth_date: dateOfBirth,
        captcha_token: '12',
      });

      if (isEmailSent) {
        // Save to store
        setStoreName(name);
        setStoreEmail(email);
        setStoreDateOfBirth(dateOfBirth);

        Toast.show({
          type: 'success',
          text1: 'Verification code sent',
          text2: 'Please check your email for the verification code.',
        });
        router.push('/(auth)/sign-up/verify-code');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to send verification code',
          text2: 'Please try again.',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={true} onBackPress={onBackPress} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.title}>
            <AuthTitle title="Create your account" />
          </View>

          <AuthInput
            description=""
            label="Name"
            value={name}
            onChange={onchangeName}
            type="text"
            status="success"
            showCheck={isValidName && name.length > 0}
            errorMessage={`Maximum 50 characters (${name.length}/50)`}
          />

          <AuthInput
            description=""
            label="Email"
            value={email}
            onChange={setEmail}
            type="text"
            status={email.length >= 2 && !isEmailValid ? 'error' : 'success'}
            showCheck={email.length >= 2 && isEmailValid}
            errorMessage={email.length >= 2 && !isEmailValid ? 'Please enter a valid email address' : ''}
          />

          <AuthInput
            description="This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else."
            label="Date of birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            type="date"
            status={dateOfBirth.length > 0 && !isBirthDateValid ? 'error' : 'success'}
            showCheck={dateOfBirth.length > 0}
            errorMessage={
              dateOfBirth.length > 0 && !isBirthDateValid ? 'You must be at least 13 years old to use this service' : ''
            }
            showDiscription={true}
          />
        </View>
      </ScrollView>

      <BottomBar
        rightButton={{
          label: 'Next',
          onPress: onNextPress,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
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

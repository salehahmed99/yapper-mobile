import * as Localization from 'expo-localization';
import { router } from 'expo-router';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';

// Schemas
import {
  emailSchema,
  loginSchema,
  passwordLogInSchema,
  phoneSchema,
  usernameSchema,
} from '@/src/modules/auth/schemas/schemas';

// Services
import { checkExists, login } from '@/src/modules/auth/services/authService';

// Components
import EmailForm from '@/src/modules/auth/components/EmailForm';
import PasswordForm from '@/src/modules/auth/components/PasswordForm';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';

// Utils
import ActivityLoader from '@/src/components/ActivityLoader';
import { ILoginResponse } from '@/src/modules/auth/types';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import { useAuthStore } from '@/src/store/useAuthStore';

// Types
type InputType = 'email' | 'phone' | 'username' | null;
type LoginStep = 1 | 2;

const LoginScreen = () => {
  // ============================================
  // State Management
  // ============================================
  const [currentStep, setCurrentStep] = useState<LoginStep>(1);
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [nextState, setNextState] = useState(false);
  const [inputType, setInputType] = useState<InputType>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // Hooks & Constants
  // ============================================
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';
  const loginUser = useAuthStore((state) => state.loginUser);
  const { t } = useTranslation();

  // ============================================
  // Input Detection & Validation
  // ============================================
  const detectTextType = useCallback(
    (input: string): InputType => {
      const trimmed = input.trim();

      // Check for email
      if (emailSchema.safeParse(trimmed).success) {
        return 'email';
      }

      // Check for phone number
      const parsedPhoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
      if (
        parsedPhoneNumber &&
        parsedPhoneNumber.isValid() &&
        parsedPhoneNumber.getType() === 'MOBILE' &&
        phoneSchema.safeParse(trimmed).success
      ) {
        return 'phone';
      }

      // Check for username
      if (usernameSchema.safeParse(trimmed).success) {
        return 'username';
      }

      return null;
    },
    [defaultCountry],
  );

  // ============================================
  // Event Handlers
  // ============================================
  const onTextChange = (input: string) => {
    setText(input);
    const type = detectTextType(input);
    setInputType(type);
    setNextState(type !== null);
  };

  const onPasswordChange = (input: string) => {
    setPassword(input);
    const isValid = passwordLogInSchema.safeParse(input).success;
    setNextState(isValid);
  };

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleBack = () => {
    router.replace('/(auth)/welcome');
  };

  const handleForgotPassword = () => {
    router.replace('/(auth)/forgot-password/find-account');
  };

  // ============================================
  // Step 1: User Identifier Validation
  // ============================================
  const handleStepOne = async (): Promise<boolean> => {
    if (!inputType) {
      Toast.show({
        type: 'error',
        text1: t('auth.login.errors.invalidInput'),
        text2: t('auth.login.errors.invalidInputDescription'),
      });
      return false;
    }
    setIsLoading(true);
    setNextState(false);

    try {
      const exists = await checkExists(text);
      if (!exists) {
        Alert.alert(t('auth.login.errors.userNotFound'), t('auth.login.errors.userNotFoundDescription'));
        return false;
      }
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || t('auth.login.errors.unableToVerify');
      Toast.show({
        type: 'error',
        text1: t('auth.login.errors.error'),
        text2: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
      setNextState(true);
    }
  };

  // ============================================
  // Step 2: Password Validation & Login
  // ============================================
  const handleStepTwo = async (): Promise<void> => {
    // Validate password
    if (!passwordLogInSchema.safeParse(password).success) {
      Alert.alert(t('auth.login.errors.invalidPassword'), t('auth.login.errors.invalidPasswordDescription'));
      return;
    }

    // Validate input type
    if (!inputType) {
      Toast.show({
        type: 'error',
        text1: t('auth.login.errors.invalidInput'),
        text2: t('auth.login.errors.invalidInputDescription'),
      });
      return;
    }

    // Prepare login data
    const loginData = {
      identifier: text,
      password,
      type: inputType === 'phone' ? ('phone_number' as const) : inputType,
    };

    // Validate login schema
    if (!loginSchema.safeParse(loginData).success) {
      Toast.show({
        type: 'error',
        text1: t('auth.login.errors.invalidLoginData'),
        text2: t('auth.login.errors.invalidLoginDataDescription'),
      });
      return;
    }

    setIsLoading(true);
    setNextState(false);

    // Attempt login
    try {
      const data: ILoginResponse = await login(loginData);
      Toast.show({
        type: 'success',
        text1: t('auth.login.success.loginSuccessful'),
        text2: t('auth.login.success.welcomeBack'),
      });
      await loginUser(data.data.user, data.data.accessToken);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('auth.login.errors.unableToLogin');

      Toast.show({
        type: 'error',
        text1: t('auth.login.errors.loginFailed'),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setNextState(true);
    }
  };

  // ============================================
  // Main Handler
  // ============================================
  const handleNext = async () => {
    Keyboard.dismiss();
    if (currentStep === 1) {
      const isValid = await handleStepOne();
      if (isValid) {
        setCurrentStep(2);
        setNextState(false);
      }
    } else {
      await handleStepTwo();
    }
  };

  // ============================================
  // Render
  // ============================================
  return (
    <>
      <ActivityLoader visible={isLoading} message="Loading..." />
      <TopBar onBackPress={handleBack} />

      {currentStep === 1 ? (
        <EmailForm text={text} onTextChange={onTextChange} />
      ) : (
        <PasswordForm
          userIdentifier={text}
          password={password}
          onPasswordChange={onPasswordChange}
          onTogglePasswordVisibility={handleTogglePasswordVisibility}
          isPasswordVisible={isPasswordVisible}
        />
      )}

      <BottomBar
        rightButton={{
          label: currentStep === 1 ? ButtonOptions.NEXT : ButtonOptions.LOGIN,
          onPress: handleNext,
          enabled: nextState,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: ButtonOptions.FORGOT_PASSWORD,
          onPress: handleForgotPassword,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </>
  );
};

export default LoginScreen;

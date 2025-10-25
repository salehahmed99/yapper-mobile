import { useCallback, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Localization from 'expo-localization';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Schemas
import {
  emailSchema,
  loginSchema,
  passwordLogInSchema,
  phoneSchema,
  usernameSchema,
} from '@/src/modules/auth/schemas/schemas';

// Hooks
import { useAuth } from '@/src/modules/auth/hooks/useAuth';

// Services
import { checkExists } from '@/src/modules/auth/services/authService';

// Components
import TopBar from '../../src/modules/auth/components/TobBar';
import FirstPageLogin from '../../src/modules/auth/components/FirstPageLogin';
import SecondPageLogin from '../../src/modules/auth/components/SecondPageLogin';
import BottomBar from '../../src/modules/auth/components/BottomBar';

// Utils
import { ButtonOptions } from '../../src/modules/auth/utils/enums';

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

  // ============================================
  // Hooks & Constants
  // ============================================
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';
  const { loginUser } = useAuth();

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
      const phoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
      if (
        phoneNumber &&
        phoneNumber.isValid() &&
        phoneNumber.getType() === 'MOBILE' &&
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
    if (currentStep === 2) {
      setCurrentStep(1);
      setNextState(text.length > 0);
      setPassword('');
    } else {
      Alert.alert('Back button pressed');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password pressed');
  };

  // ============================================
  // Step 1: User Identifier Validation
  // ============================================
  const handleStepOne = async (): Promise<boolean> => {
    if (!inputType) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter a valid email, phone number, or username.',
      });
      return false;
    }

    try {
      const exists = await checkExists(text);
      if (!exists) {
        Alert.alert('User Not Found', 'This user does not exist. Please check your input or register a new account.');
        return false;
      }
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || 'Unable to verify user existence. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      return false;
    }
  };

  // ============================================
  // Step 2: Password Validation & Login
  // ============================================
  const handleStepTwo = async (): Promise<void> => {
    // Validate password
    if (!passwordLogInSchema.safeParse(password).success) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
      return;
    }

    // Validate input type
    if (!inputType) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter a valid email, phone number, or username.',
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
        text1: 'Invalid Login Data',
        text2: 'Please check your credentials and try again.',
      });
      return;
    }

    // Attempt login
    try {
      await loginUser(loginData);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to login. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
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
      <TopBar onBackPress={handleBack} />

      {currentStep === 1 ? (
        <FirstPageLogin text={text} onTextChange={onTextChange} />
      ) : (
        <SecondPageLogin
          userIdentifier={text}
          password={password}
          onPasswordChange={onPasswordChange}
          onTogglePasswordVisibility={handleTogglePasswordVisibility}
          isPasswordVisible={isPasswordVisible}
        />
      )}

      <BottomBar
        text={currentStep === 1 ? ButtonOptions.NEXT : ButtonOptions.LOGIN}
        isNextEnabled={nextState}
        onNext={handleNext}
        onForgotPassword={handleForgotPassword}
      />
    </>
  );
};

export default LoginScreen;

import {
  emailSchema,
  loginSchema,
  passwordSchema,
  phoneSchema,
  usernameSchema,
} from '@/src/modules/auth/schemas/schemas';
import * as Localization from 'expo-localization';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { useCallback, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';
import BottomBar from '../../src/modules/auth/components/bottom-bar';
import FirstPageLogin from '../../src/modules/auth/components/first-page-login';
import SecondPageLogin from '../../src/modules/auth/components/second-page-login';
import TopBar from '../../src/modules/auth/components/top-bar';
import { login } from '../../src/modules/auth/services/authService';
import { buttonOptions } from '../../src/modules/auth/utils/enums';

const LoginScreen = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [nextState, setNextState] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'username' | null>(null);
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';

  const detectTextType = useCallback(
    (input: string) => {
      const trimmed = input.trim();

      if (emailSchema.safeParse(trimmed).success) {
        return 'email';
      }
      const phoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
      if (
        phoneNumber &&
        phoneNumber.isValid() &&
        phoneNumber.getType() === 'MOBILE' &&
        phoneSchema.safeParse(trimmed).success
      ) {
        return 'phone';
      }
      if (usernameSchema.safeParse(trimmed).success) {
        return 'username';
      }
      return null;
    },
    [defaultCountry]
  );

  const onTextChange = (input: string) => {
    setText(input);
    setNextState(input.length > 0);
    setInputType(detectTextType(input));
  };

  const onPasswordChange = (input: string) => {
    setPassword(input);
    setNextState(input.length > 0);
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (currentStep === 1) {
      // Move to password step
      if (!inputType) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Please enter a valid email, phone number, or username.',
        });
        return;
      }
      setCurrentStep(2);
      setNextState(false);
    } else {
      if (!passwordSchema.safeParse(password).success) {
        Alert.alert(
          'Invalid Password',
          'Password must be 8–64 characters long and include uppercase, lowercase, number, and special character.'
        );
        return;
      }
      const loginData = { identifier: text, password };
      if (!loginSchema.safeParse(loginData).success) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Login Data',
          text2: 'Please check your credentials and try again.',
        });
        return;
      }
      // Submit login
      login({ email: text, password })
        .then((response) => {
          console.log('Login response:', response);
          Toast.show({
            type: 'success',
            text1: 'Login Successful',
            text2: `Welcome back, ${response?.data?.user?.name}!`,
          });
        })
        .catch((error) => {
          // Error handling is done in the login service
        });
    }
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
          onTogglePasswordVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
          isPasswordVisible={isPasswordVisible}
        />
      )}

      <BottomBar
        text={currentStep === 1 ? buttonOptions.NEXT : buttonOptions.SUBMIT}
        isNextEnabled={nextState}
        onNext={handleNext}
        onForgotPassword={() => {
          Alert.alert('Forgot Password pressed');
        }}
      />
    </>
  );
};

export default LoginScreen;

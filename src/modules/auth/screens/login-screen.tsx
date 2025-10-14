import { Alert, Keyboard } from 'react-native';
import TopBar from '../components/top-bar';
import BottomBar from '../components/bottom-bar';
import validator from 'validator';
import FirstPageLogin from '../components/first-page-login';
import SecondPageLogin from '../components/second-page-login';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js/max';
import { useCallback, useEffect, useState } from 'react';
import * as Localization from 'expo-localization';
import { buttonOptions } from '../utils/enums';

const LoginScreen = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [nextState, setNextState] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'username' | null>(null);
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';
  
  const detectTextType = useCallback((input: string) => {
    const trimmed = input.trim();

    if (validator.isEmail(trimmed)) {
      return 'email';
    }
    const phoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
    if (phoneNumber && phoneNumber.isValid() && phoneNumber.getType() === 'MOBILE') {
      return 'phone';
    }
    return 'username';
  }, [defaultCountry]);

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
      Alert.alert('Invalid Input', 'Please enter a valid email, phone, or username');
      return;
    }
      setCurrentStep(2);
      setNextState(false);
    } else {
        if (password.length < 8) {
            Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
            return;
        }
        Alert.alert('Login Successful', `Logged in with ${inputType}: ${text}`);
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
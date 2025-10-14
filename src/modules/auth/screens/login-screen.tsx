import { Alert } from 'react-native';
import TopBar from '../components/top-bar';
import BottomBar from '../components/bottom-bar';
import validator from 'validator';
import FirstPageLogin from '../components/first-page-login';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { useCallback, useEffect, useState } from 'react';
import * as Localization from 'expo-localization';

const LoginScreen = () => {
  const [text, setText] = useState('');
  const [nextState, setNextState] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'username' | null>(null);
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';
  
  const detectTextType = useCallback(
    (input: string) => {
      const trimmed = input.trim();

      if (validator.isEmail(trimmed)) return 'email';

      const phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry as CountryCode);

      if (phoneNumber && phoneNumber.isValid()) {
        const nationalLength = phoneNumber.nationalNumber.length;
        if (nationalLength >= 8 && nationalLength <= 15) return 'phone';
      }

      return 'username';
    },
    [defaultCountry]
  );

  const onTextChange = (input: string) => {
    setText(input);
    setNextState(input.length > 0);
    setInputType(detectTextType(input));
  };
  useEffect(() => {
    if (text.length > 0) {
      const type = detectTextType(text);
      console.log(`Detected input type: ${type}`);
    }
  }, [text, detectTextType]);
  return (
    <>
      <TopBar
        onBackPress={() => {
          Alert.alert('Back button pressed');
        }}
      />
      <FirstPageLogin text={text} onTextChange={onTextChange} />
      <BottomBar
        isNextEnabled={nextState}
        onNext={() => {
          Alert.alert('Next button pressed');
        }}
        onForgotPassword={() => {
          Alert.alert('Forgot Password pressed');
        }}
      />
    </>
  );
};
export default LoginScreen;

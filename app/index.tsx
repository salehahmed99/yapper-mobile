import LoginScreen from '@/app/(auth)/login';
import React from 'react';
import Toast from 'react-native-toast-message';

const HomeScreen = () => {
  return (
    <>
      <LoginScreen />
      <Toast />
    </>
  );
};

export default HomeScreen;

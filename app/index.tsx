import LoginScreen from '@/app/(auth)/login';
import React from 'react';
import { StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

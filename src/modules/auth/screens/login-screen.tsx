import React from 'react';
import { Alert } from 'react-native';
import TopBar from '../components/top-bar';
import BottomBar from '../components/bottom-bar';

const LoginScreen = () => {
    return (
        <>
        <TopBar onBackPress={() => { Alert.alert('Back button pressed'); }} />
        <BottomBar isNextEnabled={true} onNext={() => { Alert.alert('Next button pressed'); }} onForgotPassword={() => { Alert.alert('Forgot Password pressed'); }} />
        </>
    )
}
export default LoginScreen;

    
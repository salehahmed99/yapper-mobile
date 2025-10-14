import React from 'react';
import { Alert } from 'react-native';
import TopBar from '../components/top-bar';
import BottomBar from '../components/bottom-bar';
import FirstPageLogin from '../components/first-page-login';

const LoginScreen = () => {
    const [text, setText] = React.useState('');
    return (
        <>
        <TopBar onBackPress={() => { Alert.alert('Back button pressed'); }} />
            <FirstPageLogin text={text} onTextChange={setText} />
        <BottomBar isNextEnabled={true} onNext={() => { Alert.alert('Next button pressed'); }} onForgotPassword={() => { Alert.alert('Forgot Password pressed'); }} />
        </>
    )
}
export default LoginScreen;

    
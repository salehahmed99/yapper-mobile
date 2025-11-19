/* eslint-disable @typescript-eslint/no-explicit-any */
import VerifyCodeScreen from '@/app/(auth)/sign-up/verify-code';
import { Theme } from '@/src/constants/theme';
import { resendVerificationCode, verifySignUpOTP } from '@/src/modules/auth/services/signUpService';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'auth.signUp.verifyCode.title': 'We sent you a code',
        'auth.signUp.verifyCode.emailSent': 'Enter it below to verify',
        'auth.signUp.verifyCode.description': 'Sent to {{email}}',
        'auth.signUp.verifyCode.label': 'Verification code',
        'auth.signUp.verifyCode.resendText': "Didn't receive email? Resend",
        'auth.signUp.verifyCode.verifying': 'Verifying...',
        'auth.signUp.verifyCode.resending': 'Resending...',
        'auth.signUp.verifyCode.errors.invalidCode': 'Invalid code',
        'auth.signUp.verifyCode.errors.sixDigit': 'Code must be 6 digits',
        'auth.signUp.verifyCode.errors.incorrectCode': 'The code you entered is incorrect',
        'auth.signUp.verifyCode.errors.verificationFailed': 'Verification failed',
        'auth.signUp.verifyCode.errors.generic': 'An error occurred',
        'auth.signUp.verifyCode.errors.resendFailed': 'Failed to resend code',
        'auth.signUp.verifyCode.errors.tryAgain': 'Please try again',
        'auth.signUp.verifyCode.errors.error': 'Error',
        'auth.signUp.verifyCode.success.codeVerified': 'Code verified',
        'auth.signUp.verifyCode.success.emailVerified': 'Email verified successfully',
        'auth.signUp.verifyCode.success.codeResent': 'Code resent',
        'auth.signUp.verifyCode.success.newCodeSent': 'A new code has been sent to your email',
        'buttons.next': 'Next',
        'buttons.back': 'Back',
      };
      if (params && translations[key]) {
        return translations[key].replace('{{email}}', String(params.email));
      }
      return translations[key] || key;
    },
  }),
}));

// Mock ThemeContext
const mockTheme: Theme = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      link: '#1DA1F2',
    },
    button: {
      primary: '#1DA1F2',
      disabled: '#cccccc',
    },
  },
  spacing: {
    sm: 16,
    md: 12,
    mdg: 20,
  },
  typography: {
    sizes: {
      sm: 14,
    },
    fonts: {
      regular: 'System',
    },
  },
} as unknown as Theme;

jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}));

// Mock Zustand store
const mockSetVerificationToken = jest.fn();
const mockSetUserNames = jest.fn();
let mockEmail = 'test@example.com';

jest.mock('@/src/modules/auth/store/useSignUpStore', () => ({
  useSignUpStore: jest.fn((selector) => {
    const store = {
      email: mockEmail,
      setVerificationToken: mockSetVerificationToken,
      setUserNames: mockSetUserNames,
    };
    return selector(store);
  }),
}));

// Mock signUpService
jest.mock('@/src/modules/auth/services/signUpService', () => ({
  verifySignUpOTP: jest.fn(),
  resendVerificationCode: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

// Mock ActivityLoader
jest.mock('@/src/components/ActivityLoader', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ visible, message }: { visible: boolean; message?: string }) =>
    visible ? React.createElement(View, { testID: 'activity-loader' }, React.createElement(Text, {}, message)) : null;
});

// Mock auth components
jest.mock('@/src/modules/auth/components/shared/AuthInput', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'auth-input', ...props });
});

jest.mock('@/src/modules/auth/components/shared/BottomBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'bottom-bar', ...props });
});

jest.mock('@/src/modules/auth/components/shared/Title', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => React.createElement(Text, { testID: 'auth-title' }, props.title);
});

jest.mock('@/src/modules/auth/components/shared/TopBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'top-bar', ...props });
});

describe('VerifyCodeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmail = 'test@example.com';
  });

  describe('Rendering', () => {
    it('should render the screen successfully with email description', () => {
      const { getByText, getByTestId } = render(<VerifyCodeScreen />);

      expect(getByText('We sent you a code')).toBeTruthy();
      expect(getByText('Enter it below to verify')).toBeTruthy();
      expect(getByTestId('top-bar')).toBeTruthy();
      expect(getByTestId('bottom-bar')).toBeTruthy();

      const authInput = getByTestId('auth-input');
      expect(authInput).toBeTruthy();
      expect(authInput.props.description).toBe('Sent to test@example.com');
    });
  });

  describe('Navigation', () => {
    it('should redirect to create account screen if no email in store', () => {
      mockEmail = '';
      render(<VerifyCodeScreen />);

      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });

    it('should navigate to landing screen when back button on top bar is pressed', () => {
      const { getByTestId } = render(<VerifyCodeScreen />);
      const topBar = getByTestId('top-bar');

      fireEvent(topBar, 'onBackPress');

      expect(router.replace).toHaveBeenCalledWith('/(auth)/landing-screen');
    });

    it('should navigate to create account screen when back button is pressed', () => {
      const { getByTestId } = render(<VerifyCodeScreen />);
      const bottomBar = getByTestId('bottom-bar');

      bottomBar.props.leftButton.onPress();

      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });
  });

  describe('Form Validation', () => {
    it('should enable next button only when code is exactly 6 digits', () => {
      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      // Empty code
      expect(bottomBar.props.rightButton.enabled).toBe(false);

      // Less than 6 digits
      fireEvent(authInput, 'onChange', '12345');
      expect(bottomBar.props.rightButton.enabled).toBe(false);

      // Exactly 6 digits
      fireEvent(authInput, 'onChange', '123456');
      expect(bottomBar.props.rightButton.enabled).toBe(true);
    });

    it('should show error toast when submitting invalid code length', async () => {
      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(authInput, 'onChange', '123');
      await bottomBar.props.rightButton.onPress();

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid code',
        text2: 'Code must be 6 digits',
      });
    });
  });

  describe('Code Verification', () => {
    it('should show success toast and navigate on successful verification', async () => {
      (verifySignUpOTP as jest.Mock).mockResolvedValue({
        data: { isVerified: true, recommendations: ['user1', 'user2'] },
      });

      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(authInput, 'onChange', '123456');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(verifySignUpOTP).toHaveBeenCalledWith({
          email: 'test@example.com',
          token: '123456',
        });
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Code verified',
          text2: 'Email verified successfully',
        });
        expect(mockSetVerificationToken).toHaveBeenCalledWith('123456');
        expect(mockSetUserNames).toHaveBeenCalledWith(['user1', 'user2']);
        expect(router.push).toHaveBeenCalledWith('/(auth)/sign-up/enter-password');
      });
    });

    it('should show error toast when verification fails', async () => {
      (verifySignUpOTP as jest.Mock).mockResolvedValue({
        data: { isVerified: false },
        message: 'Code expired',
      });

      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(authInput, 'onChange', '123456');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Invalid code',
          text2: 'Code expired',
        });
        expect(mockSetVerificationToken).toHaveBeenCalledWith('');
      });
    });

    it('should handle network error during verification', async () => {
      const error = new Error('Network error');
      (verifySignUpOTP as jest.Mock).mockRejectedValue(error);

      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(authInput, 'onChange', '123456');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Verification failed',
          text2: 'Network error',
        });
      });
    });

    it('should handle unknown error during verification', async () => {
      (verifySignUpOTP as jest.Mock).mockRejectedValue('Unknown error');

      const { getByTestId } = render(<VerifyCodeScreen />);
      const authInput = getByTestId('auth-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(authInput, 'onChange', '123456');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Verification failed',
          text2: 'An error occurred',
        });
      });
    });
  });

  describe('Code Resend', () => {
    it('should show success toast when code is resent successfully', async () => {
      (resendVerificationCode as jest.Mock).mockResolvedValue(true);

      const { getByText } = render(<VerifyCodeScreen />);
      const resendButton = getByText("Didn't receive email? Resend");

      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(resendVerificationCode).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Code resent',
          text2: 'A new code has been sent to your email',
        });
      });
    });

    it('should show error toast when resend fails', async () => {
      (resendVerificationCode as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(<VerifyCodeScreen />);
      const resendButton = getByText("Didn't receive email? Resend");

      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Failed to resend code',
          text2: 'Please try again',
        });
      });
    });

    it('should handle network error during resend', async () => {
      const error = new Error('Network error');
      (resendVerificationCode as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<VerifyCodeScreen />);
      const resendButton = getByText("Didn't receive email? Resend");

      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Network error',
        });
      });
    });

    it('should handle unknown error during resend', async () => {
      (resendVerificationCode as jest.Mock).mockRejectedValue('Unknown error');

      const { getByText } = render(<VerifyCodeScreen />);
      const resendButton = getByText("Didn't receive email? Resend");

      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred',
        });
      });
    });
  });
});

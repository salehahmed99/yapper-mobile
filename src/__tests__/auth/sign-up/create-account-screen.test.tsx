/* eslint-disable @typescript-eslint/no-explicit-any */
import CreateAccountScreen from '@/app/(auth)/sign-up/create-account-screen';
import { Theme } from '@/src/constants/theme';
import { signUpStep1 } from '@/src/modules/auth/services/signUpService';
import { render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'auth.signUp.createAccount.title': 'Create your account',
        'auth.signUp.createAccount.nameLabel': 'Name',
        'auth.signUp.createAccount.nameError': 'Name must be 50 characters or less ({{count}})',
        'auth.signUp.createAccount.emailLabel': 'Email',
        'auth.signUp.createAccount.emailError': 'Please enter a valid email',
        'auth.signUp.createAccount.dateOfBirthLabel': 'Date of birth',
        'auth.signUp.createAccount.dateOfBirthDescription': 'This will not be shown publicly',
        'auth.signUp.createAccount.dateOfBirthError': 'Please enter a valid date of birth',
        'auth.signUp.createAccount.errors.fillAllFields': 'Please fill all fields',
        'auth.signUp.createAccount.errors.failedToSend': 'Failed to send verification code',
        'auth.signUp.createAccount.errors.tryAgain': 'Please try again',
        'auth.signUp.createAccount.errors.error': 'Error',
        'auth.signUp.createAccount.errors.generic': 'An error occurred',
        'auth.signUp.createAccount.success.codeSent': 'Code sent',
        'auth.signUp.createAccount.success.checkEmail': 'Check your email',
        'auth.signUp.createAccount.captcha.expired': 'Captcha expired',
        'auth.signUp.createAccount.captcha.tryAgain': 'Please try again',
        'buttons.next': 'Next',
      };
      return params ? translations[key]?.replace('{{count}}', String(params.count)) : translations[key] || key;
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
    },
    button: {
      primary: '#1DA1F2',
      disabled: '#cccccc',
    },
  },
  spacing: {
    xl: 24,
    xxxl: 32,
  },
} as unknown as Theme;

jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}));

// Mock Zustand store
const mockSetName = jest.fn();
const mockSetEmail = jest.fn();
const mockSetDateOfBirth = jest.fn();

jest.mock('@/src/modules/auth/store/useSignUpStore', () => ({
  useSignUpStore: jest.fn((selector) => {
    const store = {
      setName: mockSetName,
      setEmail: mockSetEmail,
      setDateOfBirth: mockSetDateOfBirth,
    };
    return selector(store);
  }),
}));

// Mock signUpService
jest.mock('@/src/modules/auth/services/signUpService', () => ({
  signUpStep1: jest.fn(),
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
  const { View } = require('react-native');
  return ({ visible }: { visible: boolean }) => React.createElement(View, { testID: 'activity-loader', visible });
});

// Mock ReCaptcha
const mockReCaptchaOpen = jest.fn();
const mockReCaptchaClose = jest.fn();
let mockReCaptchaProps: any = {};

jest.mock('@/src/components/ReCaptcha', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      mockReCaptchaProps = props;
      React.useImperativeHandle(ref, () => ({
        open: mockReCaptchaOpen,
        close: mockReCaptchaClose,
      }));
      const { View } = require('react-native');
      return React.createElement(View, { testID: 'recaptcha-component' });
    }),
  };
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

describe('CreateAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReCaptchaProps = {};
    process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';
  });

  describe('Rendering', () => {
    it('should render the screen successfully', () => {
      const { getByText, getByTestId } = render(<CreateAccountScreen />);
      expect(getByText('Create your account')).toBeTruthy();
      expect(getByTestId('top-bar')).toBeTruthy();
      expect(getByTestId('bottom-bar')).toBeTruthy();
    });
  });

  describe('ReCaptcha Integration', () => {
    it('should pass correct props to ReCaptcha component', () => {
      render(<CreateAccountScreen />);

      expect(mockReCaptchaProps.siteKey).toBe('test-site-key');
      expect(mockReCaptchaProps.size).toBe('normal');
      expect(mockReCaptchaProps.theme).toBe('light');
      expect(mockReCaptchaProps.lang).toBe('en');
      expect(mockReCaptchaProps.onVerify).toBeDefined();
      expect(mockReCaptchaProps.onError).toBeDefined();
      expect(mockReCaptchaProps.onExpire).toBeDefined();
    });

    it('should save to store and navigate on successful submission', async () => {
      (signUpStep1 as jest.Mock).mockResolvedValue(true);

      render(<CreateAccountScreen />);

      await mockReCaptchaProps.onVerify('test-token-123');

      await waitFor(() => {
        expect(mockSetName).toHaveBeenCalled();
        expect(mockSetEmail).toHaveBeenCalled();
        expect(mockSetDateOfBirth).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith('/(auth)/sign-up/verify-code');
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Code sent',
          text2: 'Check your email',
        });
      });
    });

    it('should show error toast when signUpStep1 returns false', async () => {
      (signUpStep1 as jest.Mock).mockResolvedValue(false);

      render(<CreateAccountScreen />);

      await mockReCaptchaProps.onVerify('test-token-123');

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Failed to send verification code',
          text2: 'Please try again',
        });
      });
    });

    it('should handle network error during submission', async () => {
      const error = new Error('Network error');
      (signUpStep1 as jest.Mock).mockRejectedValue(error);

      render(<CreateAccountScreen />);

      await mockReCaptchaProps.onVerify('test-token-123');

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Network error',
        });
      });
    });

    it('should handle unknown error during submission', async () => {
      (signUpStep1 as jest.Mock).mockRejectedValue('Unknown error');

      render(<CreateAccountScreen />);

      await mockReCaptchaProps.onVerify('test-token-123');

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred',
        });
      });
    });
  });

  describe('Captcha Error Handling', () => {
    it('should show error toast on captcha error', () => {
      render(<CreateAccountScreen />);

      mockReCaptchaProps.onError('Captcha verification failed');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Captcha verification failed',
      });
    });

    it('should show info toast on captcha expire', () => {
      render(<CreateAccountScreen />);

      mockReCaptchaProps.onExpire();

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: 'Captcha expired',
        text2: 'Please try again',
      });
    });
  });

  describe('Loading State', () => {
    it('should show ActivityLoader during submission', async () => {
      (signUpStep1 as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
      );

      const { getByTestId } = render(<CreateAccountScreen />);

      const verifyPromise = mockReCaptchaProps.onVerify('test-token-123');

      await waitFor(() => {
        const activityLoader = getByTestId('activity-loader');
        expect(activityLoader.props.visible).toBe(true);
      });

      await verifyPromise;
    });
  });
});

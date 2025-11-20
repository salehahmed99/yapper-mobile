/* eslint-disable @typescript-eslint/no-explicit-any */
import EnterPasswordScreen from '@/app/(auth)/sign-up/enter-password';
import { Theme } from '@/src/constants/theme';
import { signUpStep3 } from '@/src/modules/auth/services/signUpService';
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
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.signUp.enterPassword.title': "You'll need a password",
        'auth.signUp.enterPassword.description': "Make sure it's 8 characters or more",
        'auth.signUp.enterPassword.passwordLabel': 'Password',
        'auth.signUp.enterPassword.passwordError': 'Password must be at least 8 characters',
        'auth.signUp.enterPassword.signUpButton': 'Sign up',
        'auth.signUp.enterPassword.errors.invalidPassword': 'Invalid password',
        'auth.signUp.enterPassword.errors.passwordRequirements':
          'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        'auth.signUp.enterPassword.errors.error': 'Error',
        'auth.signUp.enterPassword.errors.generic': 'An error occurred',
        'auth.signUp.enterPassword.success.accountCreated': 'Account created',
        'auth.signUp.enterPassword.success.accountCreatedDesc': 'Welcome to Yapper!',
        'auth.signUp.enterPassword.termsPrefix': 'By signing up, you agree to the',
        'auth.signUp.enterPassword.termsOfService': 'Terms of Service',
        'auth.signUp.enterPassword.and': 'and',
        'auth.signUp.enterPassword.privacyPolicy': 'Privacy Policy',
        'auth.signUp.enterPassword.including': 'including',
        'auth.signUp.enterPassword.cookieUse': 'Cookie Use',
        'auth.signUp.enterPassword.termsDescription':
          'Others will be able to find you by email or phone number, when provided',
        'auth.signUp.enterPassword.learnMore': 'Learn more',
        'auth.signUp.enterPassword.findableText': 'You can change this in your settings',
        'auth.signUp.enterPassword.here': 'here',
      };
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
    xl: 24,
    md: 12,
    lg: 16,
    xs: 8,
  },
  typography: {
    sizes: {
      sm: 14,
      xs: 12,
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

// Mock Zustand stores
let mockEmail = 'test@example.com';
let mockVerificationToken = '123456';
const mockUserNames = ['testuser'];

jest.mock('@/src/modules/auth/store/useSignUpStore', () => ({
  useSignUpStore: jest.fn((selector) => {
    const store = {
      email: mockEmail,
      verificationToken: mockVerificationToken,
      userNames: mockUserNames,
    };
    return selector(store);
  }),
}));

const mockLoginUser = jest.fn();
const mockSetSkipRedirect = jest.fn();

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      loginUser: mockLoginUser,
      setSkipRedirect: mockSetSkipRedirect,
    };
    return selector(store);
  }),
}));

// Mock signUpService
jest.mock('@/src/modules/auth/services/signUpService', () => ({
  signUpStep3: jest.fn(),
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
  return ({ visible }: { visible: boolean }) =>
    visible ? React.createElement(View, { testID: 'activity-loader' }) : null;
});

// Mock auth components
jest.mock('@/src/modules/auth/components/shared/PasswordInput', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'password-input', ...props });
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

describe('EnterPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmail = 'test@example.com';
    mockVerificationToken = '123456';
  });

  describe('Rendering', () => {
    it('should render the screen successfully', () => {
      const { getByText, getByTestId } = render(<EnterPasswordScreen />);

      expect(getByText("You'll need a password")).toBeTruthy();
      expect(getByText("Make sure it's 8 characters or more")).toBeTruthy();
      expect(getByTestId('top-bar')).toBeTruthy();
      expect(getByTestId('bottom-bar')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
    });

    it('should render terms and conditions text', () => {
      const { getByText } = render(<EnterPasswordScreen />);

      expect(getByText(/By signing up, you agree to the/)).toBeTruthy();
      expect(getByText(/Terms of Service/)).toBeTruthy();
      expect(getByText(/Privacy Policy/)).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should redirect to create account screen if no email in store', () => {
      mockEmail = '';
      render(<EnterPasswordScreen />);

      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });

    it('should redirect to create account screen if no verification token', () => {
      mockVerificationToken = '';
      render(<EnterPasswordScreen />);

      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });
  });

  describe('Form Validation', () => {
    it('should disable sign up button when password is empty', () => {
      const { getByTestId } = render(<EnterPasswordScreen />);
      const bottomBar = getByTestId('bottom-bar');

      expect(bottomBar.props.rightButton.enabled).toBe(false);
    });

    it('should enable sign up button when password is valid', () => {
      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');

      const bottomBar = getByTestId('bottom-bar');
      expect(bottomBar.props.rightButton.enabled).toBe(true);
    });
  });

  describe('Password Submission', () => {
    it('should show error toast when submitting invalid password', async () => {
      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'short');
      await bottomBar.props.rightButton.onPress();

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid password',
        text2: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      });
    });

    it('should call signUpStep3 with correct parameters', async () => {
      (signUpStep3 as jest.Mock).mockResolvedValue({
        data: {
          user: { id: '1', email: 'test@example.com' },
          accessToken: 'token123',
        },
      });

      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(signUpStep3).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser',
          language: 'en',
        });
      });
    });

    it('should call loginUser and navigate on successful signup', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockToken = 'token123';

      (signUpStep3 as jest.Mock).mockResolvedValue({
        data: {
          user: mockUser,
          accessToken: mockToken,
        },
      });

      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(mockSetSkipRedirect).toHaveBeenCalledWith(true);
        expect(mockLoginUser).toHaveBeenCalledWith(mockUser, mockToken);
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Account created',
          text2: 'Welcome to Yapper!',
        });
        expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/upload-photo');
      });
    });

    it('should handle network error during signup', async () => {
      const error = new Error('Network error');
      (signUpStep3 as jest.Mock).mockRejectedValue(error);

      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Network error',
        });
      });
    });

    it('should handle unknown error during signup', async () => {
      (signUpStep3 as jest.Mock).mockRejectedValue('Unknown error');

      const { getByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred',
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show loader and disable button during signup', async () => {
      (signUpStep3 as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: {}, accessToken: '' } }), 100)),
      );

      const { getByTestId, queryByTestId } = render(<EnterPasswordScreen />);
      const passwordInput = getByTestId('password-input');
      const bottomBar = getByTestId('bottom-bar');

      fireEvent(passwordInput, 'onChangeText', 'Password123!');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(queryByTestId('activity-loader')).toBeTruthy();
        const updatedBottomBar = getByTestId('bottom-bar');
        expect(updatedBottomBar.props.rightButton.enabled).toBe(false);
      });
    });
  });
});

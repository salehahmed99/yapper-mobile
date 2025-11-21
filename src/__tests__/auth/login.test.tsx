import { ThemeProvider } from '@/src/context/ThemeContext';
import * as Schemas from '@/src/modules/auth/schemas/schemas';
import * as authService from '@/src/modules/auth/services/authService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as libphonenumber from 'libphonenumber-js/max';
import React from 'react';
import Toast from 'react-native-toast-message';
import LoginScreen from '../../../app/(auth)/login';

// Mock expo-localization FIRST
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.login.emailTitle': 'To get started, first enter your phone, email, or @username',
        'auth.login.emailLabel': 'Phone, email, or @username',
        'auth.login.passwordTitle': 'Enter your password',
        'auth.login.passwordLabel': 'Password',
        'auth.login.buttons.next': 'Next',
        'auth.login.buttons.login': 'Login',
        'auth.login.forgotPassword': 'Forgot password?',
        'auth.login.errors.invalidInput': 'Invalid Input',
        'auth.login.errors.invalidInputDescription': 'Please enter a valid email, phone number, or username.',
        'auth.login.errors.userNotFound': 'User Not Found',
        'auth.login.errors.userNotFoundDescription':
          'This user does not exist. Please check your input or register a new account.',
        'auth.login.errors.error': 'Error',
        'auth.login.errors.unableToVerify': 'Unable to verify user existence. Please try again.',
        'auth.login.errors.invalidPassword': 'Invalid Password',
        'auth.login.errors.invalidPasswordDescription': 'Password must be at least 8 characters long',
        'auth.login.errors.invalidLoginData': 'Invalid Login Data',
        'auth.login.errors.invalidLoginDataDescription': 'Please check your credentials and try again.',
        'auth.login.errors.loginFailed': 'Login Failed',
        'auth.login.errors.unableToLogin': 'Unable to login. Please try again.',
        'auth.login.success.loginSuccessful': 'Login Successful',
        'auth.login.success.welcomeBack': 'Welcome back!',
        'auth.login.alerts.backButtonPressed': 'Back button pressed',
        'auth.login.alerts.forgotPasswordPressed': 'Forgot Password pressed',
      };
      return translations[key] || key;
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock libphonenumber-js
jest.mock('libphonenumber-js/max', () => ({
  parsePhoneNumberFromString: jest.fn(() => ({
    isValid: () => true,
    getType: () => 'MOBILE',
  })),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock the checkExists and login functions
jest.mock('../../modules/auth/services/authService', () => ({
  checkExists: jest.fn().mockResolvedValue(true),
  login: jest.fn().mockResolvedValue({ token: 'mockToken', user: { id: 1, email: 'test@example.com' } }),
}));

// Get references to mocks for testing
const mockParsePhoneNumber = libphonenumber.parsePhoneNumberFromString as jest.Mock;
const mockCheckExists = authService.checkExists as jest.Mock;

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParsePhoneNumber.mockImplementation(() => ({
      isValid: () => true,
      getType: () => 'MOBILE',
    }));
    mockCheckExists.mockResolvedValue(true);
  });

  describe('UI Rendering', () => {
    it('should render all essential UI elements', () => {
      renderWithTheme(<LoginScreen />);

      expect(screen.getByDisplayValue('')).toBeTruthy();
      expect(screen.getByText('To get started, first enter your phone, email, or @username')).toBeTruthy();
      expect(screen.getByText('Next')).toBeTruthy();
      expect(screen.getByText('Forgot password?')).toBeTruthy();
    });
  });

  describe('Step 1 - Identifier Input', () => {
    it('should accept email input and proceed to password step', async () => {
      renderWithTheme(<LoginScreen />);
      const emailInput = screen.getByDisplayValue('');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');

      fireEvent.press(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
      });
    });

    it('should accept phone number input and proceed to password step', async () => {
      renderWithTheme(<LoginScreen />);
      const phoneInput = screen.getByDisplayValue('');

      fireEvent.changeText(phoneInput, '012025550123');
      fireEvent.press(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
      });
    });

    it('should accept username input', async () => {
      renderWithTheme(<LoginScreen />);
      const usernameInput = screen.getByDisplayValue('');

      fireEvent.changeText(usernameInput, 'johnsmith');
      expect(usernameInput.props.value).toBe('johnsmith');
    });

    it('should show error toast when checkExists API fails', async () => {
      mockCheckExists.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<LoginScreen />);
      const emailInput = screen.getByDisplayValue('');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(screen.getByText('Next'));

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Network error',
        });
      });
    });
  });

  describe('Step 2 - Password Input & Login', () => {
    beforeEach(async () => {
      renderWithTheme(<LoginScreen />);
      const emailInput = screen.getByDisplayValue('');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
      });
    });

    it('should call loginUser with correct credentials', async () => {
      const passwordInput = screen.getByDisplayValue('');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith(
          expect.objectContaining({
            identifier: 'test@example.com',
            password: 'password123',
          }),
        );
      });
    });

    it('should show success toast on successful login', async () => {
      const mockLogin = authService.login as jest.Mock;
      mockLogin.mockResolvedValueOnce(undefined);

      const passwordInput = screen.getByDisplayValue('');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalled();
      });
    });

    it('should show error toast on failed login', async () => {
      const mockLogin = authService.login as jest.Mock;
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
      });

      const passwordInput = screen.getByDisplayValue('');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalled();
      });
    });

    it('should show validation error when schema fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(Schemas.loginSchema, 'safeParse').mockReturnValue({ success: false } as any);

      const passwordInput = screen.getByDisplayValue('');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalled();
      });
    });
  });
});

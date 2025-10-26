import { ThemeProvider } from '@/src/context/ThemeContext';
import * as Schemas from '@/src/modules/auth/schemas/schemas';
import * as authService from '@/src/modules/auth/services/authService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as libphonenumber from 'libphonenumber-js/max';
import React from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import LoginScreen from '../../../app/(auth)/login';

// Mock expo-localization FIRST
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
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
      expect(screen.getByText('Forgot Password?')).toBeTruthy();
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

    it('should show alert when user does not exist', async () => {
      mockCheckExists.mockResolvedValueOnce(false);
      jest.spyOn(Alert, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginScreen />);
      const emailInput = screen.getByDisplayValue('');
      fireEvent.changeText(emailInput, 'nonexistent@example.com');
      fireEvent.press(screen.getByText('Next'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'User Not Found',
          'This user does not exist. Please check your input or register a new account.',
        );
      });
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
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });
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
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials',
        });
      });
    });

    it('should show validation error when schema fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(Schemas.loginSchema, 'safeParse').mockReturnValue({ success: false } as any);

      const passwordInput = screen.getByDisplayValue('');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Invalid Login Data',
          text2: 'Please check your credentials and try again.',
        });
      });
    });
  });

  describe('Forgot Password', () => {
    it('should show alert when Forgot password is pressed', () => {
      jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      renderWithTheme(<LoginScreen />);

      fireEvent.press(screen.getByText('Forgot password?'));

      expect(Alert.alert).toHaveBeenCalledWith('Forgot Password pressed');
    });
  });
});

import { ThemeProvider } from '@/src/context/ThemeContext';
import * as forgetPasswordService from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import VerifyCodeScreen from '../../../../app/(auth)/forgot-password/verify-code';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router - FIXED: Complete router mock
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
    back: mockBack,
  },
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.forgotPassword.verifyCodeTitle': 'We sent you a code',
        'auth.forgotPassword.verifyCodeDescription': 'Enter it below to verify your identity.',
        'auth.forgotPassword.verificationCodeLabel': 'Verification code',
        'auth.forgotPassword.invalidCodeTitle': 'Invalid Code',
        'auth.forgotPassword.invalidCodeDescription': 'Verification code must be 6 digits.',
        'auth.forgotPassword.codeVerifiedTitle': 'Code Verified',
        'auth.forgotPassword.codeVerifiedDescription': 'Code verified successfully.',
        'auth.forgotPassword.codeInvalidTitle': 'Invalid Code',
        'auth.forgotPassword.codeInvalidDescription': 'The verification code is invalid or expired.',
        'auth.forgotPassword.errorTitle': 'Error',
        'auth.forgotPassword.genericError': 'An unexpected error occurred. Please try again.',
        'activityLoader.verifyingCode': 'Verifying code...',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock services
jest.mock('@/src/modules/auth/services/forgetPasswordService', () => ({
  verifyOTP: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock zustand store
jest.mock('@/src/modules/auth/store/useForgetPasswordStore');

const mockUseForgotPasswordStore = useForgotPasswordStore as jest.MockedFunction<typeof useForgotPasswordStore>;

// Test component wrapped with ThemeProvider
const TestComponent = () => (
  <ThemeProvider>
    <VerifyCodeScreen />
  </ThemeProvider>
);

describe('VerifyCodeScreen', () => {
  const mockStoreActions = {
    identifier: 'test@example.com',
    setResetToken: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPasswordStore.mockImplementation((selector) => {
      const store = mockStoreActions;
      return selector(store as any);
    });
  });

  it('renders correctly', () => {
    render(<TestComponent />);

    expect(screen.getByText('We sent you a code')).toBeTruthy();
    expect(screen.getByText('Enter it below to verify your identity.')).toBeTruthy();
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('successfully verifies code and navigates to reset password', async () => {
    const mockToken = 'reset-token-123';
    (forgetPasswordService.verifyOTP as jest.Mock).mockResolvedValue(mockToken);

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '123456');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(forgetPasswordService.verifyOTP).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        token: '123456',
      });
    });

    await waitFor(() => {
      expect(mockStoreActions.setResetToken).toHaveBeenCalledWith(mockToken);
    });

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Code Verified',
        text2: 'Code verified successfully.',
      });
    });
  });

  it('shows error when verification fails', async () => {
    (forgetPasswordService.verifyOTP as jest.Mock).mockResolvedValue('');

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '123456');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'The verification code is invalid or expired.',
      });
    });
  });

  it('handles service errors correctly', async () => {
    const errorMessage = 'Network error';
    (forgetPasswordService.verifyOTP as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '123456');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    });
  });

  it('handles unknown errors correctly', async () => {
    (forgetPasswordService.verifyOTP as jest.Mock).mockRejectedValue('Unknown error');

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '123456');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    });
  });

  it('shows activity loader when verifying code', async () => {
    (forgetPasswordService.verifyOTP as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('token'), 100)),
    );

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '123456');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    expect(screen.getByText('Verifying code...')).toBeTruthy();
  });
});

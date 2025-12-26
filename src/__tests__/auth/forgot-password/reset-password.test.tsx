import { ThemeProvider } from '@/src/context/ThemeContext';
import * as passwordSchema from '@/src/modules/auth/schemas/schemas';
import * as forgetPasswordService from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import ResetPasswordScreen from '../../../../app/(auth)/forgot-password/reset-password';

// Mock Alert before importing it
const mockAlertShow = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlertShow,
  default: {
    alert: mockAlertShow,
  },
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router
jest.mock('expo-router', () => {
  const mockReplace = jest.fn();
  const mockBack = jest.fn();

  return {
    router: {
      replace: mockReplace,
      back: mockBack,
    },
    useRouter: () => ({
      replace: mockReplace,
      back: mockBack,
    }),
  };
});

// Get router mock after mocking
import { router } from 'expo-router';
const mockReplace = router.replace as jest.Mock;

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.forgotPassword.resetPasswordTitle': 'Reset your password',
        'auth.forgotPassword.resetPasswordDescription': 'Enter a new password for your account.',
        'auth.login.passwordLabel': 'Password',
        'auth.forgotPassword.confirmPasswordLabel': 'Confirm password',
        'auth.forgotPassword.weakPasswordTitle': 'Weak Password',
        'auth.forgotPassword.weakPasswordDescription': 'Password must be at least 8 characters long.',
        'auth.forgotPassword.passwordMismatchTitle': 'Password Mismatch',
        'auth.forgotPassword.passwordMismatchDescription': 'Passwords do not match.',
        'auth.forgotPassword.invalidPasswordTitle': 'Invalid Password',
        'auth.forgotPassword.invalidPasswordDescription': 'Please enter a valid password.',
        'auth.forgotPassword.successTitle': 'Password Reset Successful',
        'auth.forgotPassword.successDescription': 'Your password has been reset successfully.',
        'auth.forgotPassword.errorTitle': 'Error',
        'auth.forgotPassword.errorDescription': 'Failed to reset password. Please try again.',
        'auth.forgotPassword.genericError': 'An unexpected error occurred. Please try again.',
        'auth.forgotPassword.resettingPassword': 'Resetting password...',
        'buttons.next': 'Next',
        'buttons.back': 'Back',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock services
jest.mock('@/src/modules/auth/services/forgetPasswordService', () => ({
  resetPassword: jest.fn(),
}));

// Mock schemas
jest.mock('@/src/modules/auth/schemas/schemas', () => ({
  passwordSchema: {
    safeParse: jest.fn(),
  },
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
    <ResetPasswordScreen />
  </ThemeProvider>
);

describe('ResetPasswordScreen', () => {
  const mockStoreActions = {
    identifier: 'test@example.com',
    resetToken: 'reset-token-123',
    setNewPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPasswordStore.mockImplementation((selector) => {
      const store = mockStoreActions;
      return selector(store as any);
    });
    (mockUseForgotPasswordStore as any).getState = jest.fn(() => mockStoreActions);
    (passwordSchema.passwordSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
  });

  it('renders correctly', () => {
    render(<TestComponent />);

    expect(screen.getByText('Reset your password')).toBeTruthy();
    expect(screen.getByText('Enter a new password for your account.')).toBeTruthy();
  });

  it('redirects to find-account if no identifier or resetToken', () => {
    const incompleteStore = {
      identifier: '',
      resetToken: '',
    };

    mockUseForgotPasswordStore.mockImplementation((selector) => {
      return selector(incompleteStore as any);
    });

    render(<TestComponent />);

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/forgot-password/find-account');
  });

  it('shows alert for invalid password schema', async () => {
    (passwordSchema.passwordSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    expect(mockAlertShow).toHaveBeenCalledWith('Invalid Password', 'Please enter a valid password.');
  });

  it('successfully resets password and navigates to success screen', async () => {
    (forgetPasswordService.resetPassword as jest.Mock).mockResolvedValue(true);

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(forgetPasswordService.resetPassword).toHaveBeenCalledWith({
        resetToken: 'reset-token-123',
        newPassword: 'validpassword123',
        identifier: 'test@example.com',
      });
    });

    await waitFor(() => {
      expect(mockStoreActions.setNewPassword).toHaveBeenCalledWith('validpassword123');
    });

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'Your password has been reset successfully.',
      });
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/forgot-password/success');
    });
  });

  it('shows error when password reset fails', async () => {
    (forgetPasswordService.resetPassword as jest.Mock).mockResolvedValue(false);

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to reset password. Please try again.',
      });
    });
  });

  it('handles service errors correctly', async () => {
    const errorMessage = 'Network error';
    (forgetPasswordService.resetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

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

  it('navigates back to verify-code when back button is pressed', () => {
    render(<TestComponent />);

    const backButton = screen.getByText('Back');
    fireEvent.press(backButton);

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/forgot-password/verify-code');
  });

  it('shows activity loader when resetting password', async () => {
    (forgetPasswordService.resetPassword as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    );

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

    const nextButton = screen.getByText('Next');
    fireEvent.press(nextButton);

    expect(screen.getByText('Resetting password...')).toBeTruthy();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/forgot-password/success');
    });
  });

  it('handles unknown errors correctly', async () => {
    (forgetPasswordService.resetPassword as jest.Mock).mockRejectedValue('Unknown error');

    render(<TestComponent />);

    const inputs = screen.getAllByDisplayValue('');
    const newPasswordInput = inputs[0];
    const confirmPasswordInput = inputs[1];

    fireEvent.changeText(newPasswordInput, 'validpassword123');
    fireEvent.changeText(confirmPasswordInput, 'validpassword123');

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
});

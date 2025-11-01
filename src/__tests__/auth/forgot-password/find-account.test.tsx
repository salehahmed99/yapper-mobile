import { ThemeProvider } from '@/src/context/ThemeContext';
import * as forgetPasswordService from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import FindAccountScreen from '../../../../app/(auth)/forgot-password/find-account';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.forgotPassword.findAccountTitle': 'To get started, first enter your phone, email, or @username',
        'auth.forgotPassword.findAccountDescription': "We'll send you a verification code.",
        'auth.login.emailLabel': 'Phone, email, or @username',
        'auth.forgotPassword.invalidInputTitle': 'Invalid Input',
        'auth.forgotPassword.invalidInputDescription': 'Please enter a valid email, phone number, or username.',
        'auth.forgotPassword.codeSentTitle': 'Code Sent',
        'auth.forgotPassword.codeSentDescription': 'A verification code has been sent to your device.',
        'auth.forgotPassword.codeSendErrorTitle': 'Code Send Error',
        'auth.forgotPassword.codeSendErrorDescription': 'Failed to send verification code. Please try again.',
        'auth.forgotPassword.errorTitle': 'Error',
        'auth.forgotPassword.genericError': 'An unexpected error occurred. Please try again.',
        'activityLoader.sendingCode': 'Sending verification code...',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock services
jest.mock('@/src/modules/auth/services/forgetPasswordService', () => ({
  requestForgetPassword: jest.fn(),
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
    <FindAccountScreen />
  </ThemeProvider>
);

describe('FindAccountScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockStoreState: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = {
      identifier: '',
      textType: null,
      resetToken: '',
      setIdentifier: jest.fn(),
      detectTextType: jest.fn((input: string) => {
        // Simulate email detection
        if (input.includes('@')) {
          mockStoreState.textType = 'email';
          return 'email';
        }
        mockStoreState.textType = null;
        return null;
      }),
      setResetToken: jest.fn(),
      reset: jest.fn(),
    };

    mockUseForgotPasswordStore.mockImplementation((selector) => {
      return selector(mockStoreState);
    });
  });

  it('renders correctly', () => {
    render(<TestComponent />);

    expect(screen.getByText('To get started, first enter your phone, email, or @username')).toBeTruthy();
    expect(screen.getByText("We'll send you a verification code.")).toBeTruthy();
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('resets store on mount', () => {
    render(<TestComponent />);

    expect(mockStoreState.reset).toHaveBeenCalledTimes(1);
  });

  it('enables next button when valid email is entered', () => {
    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'test@example.com');

    expect(mockStoreState.detectTextType).toHaveBeenCalledWith('test@example.com');
  });

  it('disables next button when invalid input is entered', () => {
    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'invalid');

    expect(mockStoreState.detectTextType).toHaveBeenCalledWith('invalid');
  });

  it('successfully sends code', async () => {
    (forgetPasswordService.requestForgetPassword as jest.Mock).mockResolvedValue(true);

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'test@example.com');

    mockStoreState.textType = 'email';

    const nextButton = screen.getByLabelText('BottomBar_Action_Button');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(forgetPasswordService.requestForgetPassword).toHaveBeenCalledWith({
        identifier: 'test@example.com',
      });
    });

    await waitFor(() => {
      expect(mockStoreState.setIdentifier).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Code Sent',
        text2: 'A verification code has been sent to your device.',
      });
    });
  });

  it('shows error when code sending fails', async () => {
    (forgetPasswordService.requestForgetPassword as jest.Mock).mockResolvedValue(false);

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'test@example.com');
    mockStoreState.textType = 'email';

    const nextButton = screen.getByLabelText('BottomBar_Action_Button');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Code Send Error',
        text2: 'Failed to send verification code. Please try again.',
      });
    });
  });

  it('handles service errors correctly', async () => {
    const errorMessage = 'Network error';
    (forgetPasswordService.requestForgetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'test@example.com');
    mockStoreState.textType = 'email';

    const nextButton = screen.getByLabelText('BottomBar_Action_Button');
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
    (forgetPasswordService.requestForgetPassword as jest.Mock).mockRejectedValue('Unknown error');

    render(<TestComponent />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'test@example.com');
    mockStoreState.textType = 'email';

    const nextButton = screen.getByLabelText('BottomBar_Action_Button');
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

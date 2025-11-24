jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock authService
jest.mock('@/src/modules/auth/services/authService', () => ({
  login: jest.fn(),
}));

// Mock useAuthStore
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ loginUser: jest.fn() })),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  default: {
    show: jest.fn(),
  },
  show: jest.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SuccessResetPasswordScreen from '../../../../app/(auth)/forgot-password/success';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'auth.forgotPassword.successTitle': 'Password reset successfully',
        'auth.forgotPassword.successDescription':
          'Your password has been reset. You can now log in with your new password.',
        'auth.forgotPassword.twoFactorPrefix': 'For additional security, consider enabling',
        'auth.forgotPassword.twoFactorLink': 'two-factor authentication',
        'auth.forgotPassword.twoFactorSuffix': 'on your account.',
      })[key] || key,
  }),
}));

jest.mock('@/src/modules/auth/store/useForgetPasswordStore');
const mockUseForgotPasswordStore = useForgotPasswordStore as jest.MockedFunction<typeof useForgotPasswordStore>;

const TestComponent = () => (
  <ThemeProvider>
    <SuccessResetPasswordScreen />
  </ThemeProvider>
);

describe('SuccessResetPasswordScreen', () => {
  const mockStoreActions = {
    identifier: 'test@example.com',
    textType: 'email' as const,
    newPassword: 'testpassword123',
    resetToken: 'token-123',
    reset: jest.fn(),
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPasswordStore.mockImplementation((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreActions);
      }
      return mockStoreActions;
    });
  });

  it('renders correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('Password reset successfully')).toBeTruthy();
    expect(screen.getByText(/two-factor authentication/)).toBeTruthy();
  });
});

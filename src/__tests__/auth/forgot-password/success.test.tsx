jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

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
  const mockStoreActions = { reset: jest.fn() };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseForgotPasswordStore.mockImplementation((selector) => selector(mockStoreActions as any));
  });

  it('renders correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('Password reset successfully')).toBeTruthy();
    expect(screen.getByText(/two-factor authentication/)).toBeTruthy();
  });

  it('clears store after timeout', () => {
    render(<TestComponent />);
    jest.advanceTimersByTime(1000);
    expect(mockStoreActions.reset).toHaveBeenCalledTimes(1);
  });

  it('clears timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = render(<TestComponent />);
    unmount();
    jest.runOnlyPendingTimers();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

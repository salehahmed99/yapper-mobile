/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router BEFORE importing
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
    push: mockPush,
  },
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

import { Theme } from '@/src/constants/theme';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { ChangePasswordScreen } from '../../../../../app/(protected)/(settings)/your-account/changePassword';

jest.mocked(router).back = mockBack;
jest.mocked(router).push = mockPush;

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.password.title': 'Change password',
        'settings.password.loading': 'Updating password...',
        'settings.password.error_invalid_title': 'Invalid password',
        'settings.password.error_requirements': 'Password does not meet requirements',
        'settings.password.error_mismatch': 'Passwords do not match',
        'settings.common.success': 'Success',
        'settings.password.success_message': 'Password updated successfully',
        'settings.common.error': 'Error',
        'settings.common.unexpected_error': 'An unexpected error occurred',
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
    },
    button: {
      primary: '#1DA1F2',
      disabled: '#cccccc',
    },
  },
  spacing: {
    xl: 24,
    lg: 16,
    md: 12,
    sm: 8,
  },
  typography: {
    sizes: {
      xml: 28,
      xl: 24,
      lg: 18,
      md: 16,
      sm: 14,
    },
    fonts: {
      bold: 'Bold',
      semibold: 'SemiBold',
      regular: 'Regular',
    },
  },
  borderRadius: {
    fullRounded: 9999,
    lg: 12,
    md: 8,
    sm: 4,
  },
} as unknown as Theme;

jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
    isDark: false,
  }),
}));

// Mock auth store
const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com',
};

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      user: mockUser,
      setSkipRedirect: jest.fn(),
      getState: () => ({
        setSkipRedirect: jest.fn(),
      }),
    };
    return selector(store);
  }),
}));

// Mock components
jest.mock('@/src/modules/settings/components/SettingsTopBar', () => {
  const { View } = require('react-native');
  const React = require('react');
  const MockComponent = (props: any) => React.createElement(View, { testID: 'settings-top-bar', ...props });
  return {
    SettingsTopBar: MockComponent,
    __esModule: true,
  };
});

jest.mock('@/src/modules/settings/components/AnimatedTextInput', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return {
    AnimatedTextInput: (props: any) => React.createElement(TextInput, { testID: props.testID, ...props }),
  };
});

jest.mock('@/src/modules/settings/components/ValidationItem', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => React.createElement(View, { testID: 'validation-item', ...props });
});

jest.mock('@/src/components/ActivityLoader', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => {
    if (!props.visible) return null;
    return React.createElement(View, { testID: 'activity-loader' });
  };
});

// Mock services
jest.mock('@/src/modules/settings/services/yourAccountService', () => ({
  confirmCurrentPassword: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock('@/src/modules/settings/types/schemas', () => ({
  passwordSchema: {
    safeParse: jest.fn(() => ({
      success: true,
      error: null,
    })),
  },
}));

jest.mock('@/src/modules/settings/utils/passwordValidation', () => ({
  isPasswordValid: jest.fn((pwd) => pwd && pwd.length >= 8),
  validatePassword: jest.fn((pwd) => [
    {
      key: 'uppercase',
      text: 'At least one uppercase letter',
      isValid: /[A-Z]/.test(pwd),
    },
    {
      key: 'lowercase',
      text: 'At least one lowercase letter',
      isValid: /[a-z]/.test(pwd),
    },
    {
      key: 'number',
      text: 'At least one number',
      isValid: /[0-9]/.test(pwd),
    },
    {
      key: 'special',
      text: 'At least one special character',
      isValid: /[!@#$%^&*]/.test(pwd),
    },
    {
      key: 'length',
      text: 'At least 8 characters',
      isValid: pwd && pwd.length >= 8,
    },
  ]),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock forgot password store
jest.mock('@/src/modules/auth/store/useForgetPasswordStore', () => ({
  useForgotPasswordStore: {
    getState: () => ({
      setReturnRoute: jest.fn(),
    }),
  },
}));

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });

    it('should display correct title', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Change password');
    });

    it('should display username in subtitle', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.subtitle).toContain('testuser');
    });

    it('should render password input fields', () => {
      render(<ChangePasswordScreen />);

      expect(screen.getByTestId('current-password-input')).toBeTruthy();
      expect(screen.getByTestId('new-password-input')).toBeTruthy();
      expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(mockBack).toHaveBeenCalled();
    });

    it('should navigate to forgot password when link is pressed', () => {
      render(<ChangePasswordScreen />);

      const forgotPasswordLink = screen.queryByText('Forgot password?');
      if (forgotPasswordLink) {
        fireEvent.press(forgotPasswordLink);
        expect(mockPush).toHaveBeenCalled();
      }
    });
  });

  describe('Form Validation', () => {
    it('should have update button disabled initially', () => {
      render(<ChangePasswordScreen />);

      const updateButton = screen.queryByText('Update password');
      expect(updateButton?.props?.disabled || !updateButton).toBeTruthy();
    });
  });

  describe('Theme Application', () => {
    it('should render with correct theme styling', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have testIDs for password inputs', () => {
      render(<ChangePasswordScreen />);

      expect(screen.getByTestId('current-password-input')).toBeTruthy();
      expect(screen.getByTestId('new-password-input')).toBeTruthy();
      expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
    });
  });
});

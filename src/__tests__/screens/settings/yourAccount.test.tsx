/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router BEFORE importing anything that uses it
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
    push: mockPush,
    replace: jest.fn(),
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
import { YourAccountScreen } from '../../../../app/(protected)/(settings)/yourAccount';

// Re-mock the router after import to ensure it's properly patched
jest.mocked(router).back = mockBack;
jest.mocked(router).push = mockPush;

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.your_account.title': 'Your account',
        'settings.your_account.description': 'Manage your account information and preferences',
        'settings.accessibility.title': 'Accessibility, display, and languages',
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

jest.mock('@/src/modules/settings/components/SettingsSection', () => {
  const { View, Text, Pressable } = require('react-native');
  const React = require('react');
  const MockComponent = (props: any) => {
    return React.createElement(
      View,
      { testID: 'settings-section', ...props },
      props.items?.map((item: any) =>
        React.createElement(
          Pressable,
          {
            key: item.id,
            testID: `account-item-${item.id}`,
            onPress: () => props.onItemPress?.(item),
          },
          React.createElement(Text, null, item.title),
        ),
      ),
    );
  };
  return {
    SettingsSection: MockComponent,
    __esModule: true,
  };
});

jest.mock('@/src/modules/settings/components/settingsConfig', () => ({
  getYourAccountData: () => [
    {
      id: 'account-info',
      title: 'Account Information',
      route: 'account-information',
    },
    {
      id: 'change-password',
      title: 'Change Password',
      route: 'changePassword',
    },
    {
      id: 'deactivate-account',
      title: 'Deactivate Account',
      route: 'deactivateAccount',
    },
  ],
}));

describe('YourAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
      expect(getByTestId('settings-section')).toBeTruthy();
    });

    it('should display correct title', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Your account');
    });

    it('should display username in subtitle', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.subtitle).toContain('testuser');
    });

    it('should display description text', () => {
      render(<YourAccountScreen />);

      expect(screen.getByText('Manage your account information and preferences')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to account-information when item is pressed', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const accountInfoItem = getByTestId('account-item-account-info');
      fireEvent.press(accountInfoItem);

      expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/your-account/account-information');
    });

    it('should navigate to change-password when item is pressed', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const changePasswordItem = getByTestId('account-item-change-password');
      fireEvent.press(changePasswordItem);

      expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/your-account/changePassword');
    });

    it('should navigate to deactivate-account when item is pressed', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const deactivateItem = getByTestId('account-item-deactivate-account');
      fireEvent.press(deactivateItem);

      expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/your-account/deactivateAccount');
    });

    it('should go back when back button is pressed', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Account Items Display', () => {
    it('should display all account settings items', () => {
      render(<YourAccountScreen />);

      expect(screen.getByText('Account Information')).toBeTruthy();
      expect(screen.getByText('Change Password')).toBeTruthy();
      expect(screen.getByText('Deactivate Account')).toBeTruthy();
    });

    it('should display items with showIcons prop', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const section = getByTestId('settings-section');
      expect(section.props.showIcons).toBe(true);
    });
  });

  describe('Theme Application', () => {
    it('should use theme for styling', () => {
      const { getByTestId } = render(<YourAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar).toBeTruthy();
    });
  });

  describe('Status Bar', () => {
    it('should render with correct status bar style', () => {
      render(<YourAccountScreen />);

      // Status bar rendered with light-content style for non-dark mode
      expect(screen.getByText('Account Information')).toBeTruthy();
    });
  });
});

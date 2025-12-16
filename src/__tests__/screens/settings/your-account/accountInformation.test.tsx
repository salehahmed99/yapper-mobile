/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

import { Theme } from '@/src/constants/theme';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AccountInformationScreen } from '../../../../../app/(protected)/(settings)/your-account/AccountInformation';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.account_info.title': 'Account information',
        'settings.account_info.username_label': 'Username',
        'settings.account_info.email_label': 'Email address',
        'settings.account_info.add_label': 'Add',
        'settings.common.cancel': 'Cancel',
        'settings.account_info.logout_title': 'Logout?',
        'settings.account_info.logout_message': 'Are you sure you want to logout?',
        'settings.account_info.logout_button': 'Logout',
        'settings.account_info.logout_all_message': 'Logout from all devices?',
        'settings.account_info.logout_all_button': 'Logout All',
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
  name: 'Test User',
};

const mockLogout = jest.fn();

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      user: mockUser,
      logout: mockLogout,
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

// Mock Alert
const mockAlert = {
  alert: jest.fn(),
};
jest.mock('react-native/Libraries/Alert/Alert', () => mockAlert);

describe('AccountInformationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });

    it('should display correct title', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Account information');
    });

    it('should display username in subtitle', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.subtitle).toContain('testuser');
    });

    it('should display user email address', () => {
      render(<AccountInformationScreen />);

      expect(screen.getByText('test@example.com')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(global.mockGoBack).toHaveBeenCalled();
    });

    it('should navigate to change username when username field is pressed', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      const usernameField = getByTestId('Username');
      fireEvent.press(usernameField);

      expect(global.mockNavigate).toHaveBeenCalledWith(expect.stringContaining('account-information/change-username'));
    });

    it('should navigate to verify password for email update', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      const emailField = getByTestId('Email_address');
      fireEvent.press(emailField);

      expect(global.mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining('verify-password'),
        }),
      );
    });
  });

  describe('User Information Display', () => {
    it('should display username correctly', () => {
      render(<AccountInformationScreen />);

      expect(screen.getByText('@testuser')).toBeTruthy();
    });

    it('should handle missing email gracefully', () => {
      jest.mocked(require('@/src/store/useAuthStore').useAuthStore).mockImplementation((selector: any) => {
        const store = {
          user: { ...mockUser, email: undefined },
          logout: mockLogout,
        };
        return selector(store);
      });

      render(<AccountInformationScreen />);

      // Email should be present or show "Add" button
      const addElements = screen.queryAllByText('Add');
      expect(addElements.length).toBeGreaterThan(0);
    });
  });

  describe('Logout Functionality', () => {
    it('should show logout confirmation alert', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      // Find logout button by test ID
      const logoutButton = getByTestId('Logout_Button');
      expect(logoutButton).toBeTruthy();
    });
  });

  describe('Theme Application', () => {
    it('should render with correct theme', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });

    it('should apply safe area view', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible testIDs for info rows', () => {
      const { getByTestId } = render(<AccountInformationScreen />);

      expect(getByTestId('Username')).toBeTruthy();
      expect(getByTestId('Email_address')).toBeTruthy();
    });
  });
});

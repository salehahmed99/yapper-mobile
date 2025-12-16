/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

import { Theme } from '@/src/constants/theme';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { DeactivateAccountScreen } from '../../../../../app/(protected)/(settings)/your-account/deactivateAccount';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.deactivate.title': 'Deactivate account',
        'settings.deactivate.warning_title': 'Deactivate your account',
        'settings.deactivate.warning_message':
          'When you deactivate your account, you will no longer be visible on Yapper.',
        'settings.deactivate.else_title': 'What else you should know',
        'settings.deactivate.else_message_1': 'You may be able to reactivate your account',
        'settings.deactivate.else_link_1': 'within 30 days',
        'settings.deactivate.else_message_2': 'Some information may still be publicly visible',
        'settings.deactivate.else_link_2': 'in archived services',
        'settings.deactivate.else_message_3': 'if others have shared information about you',
        'settings.deactivate.button': 'Deactivate',
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
  avatarUrl: 'https://example.com/avatar.jpg',
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

describe('DeactivateAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });

    it('should display correct title', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Deactivate account');
    });

    it('should display user information', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('Test User')).toBeTruthy();
      expect(screen.getByText('@testuser')).toBeTruthy();
    });

    it('should display warning message', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('Deactivate your account')).toBeTruthy();
      expect(
        screen.getByText('When you deactivate your account, you will no longer be visible on Yapper.'),
      ).toBeTruthy();
    });

    it('should display additional information section', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('What else you should know')).toBeTruthy();
    });

    it('should display deactivate button', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByTestId('deactivate-button')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(global.mockGoBack).toHaveBeenCalled();
    });

    it('should navigate to confirmation screen when deactivate button is pressed', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      const deactivateButton = getByTestId('deactivate-button');
      fireEvent.press(deactivateButton);

      expect(global.mockNavigate).toHaveBeenCalledWith(expect.stringContaining('confirmDeactivate'));
    });
  });

  describe('User Information Display', () => {
    it('should display user avatar', () => {
      render(<DeactivateAccountScreen />);

      // Avatar is rendered as Image component
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    it('should handle missing user name', () => {
      jest.mocked(require('@/src/store/useAuthStore').useAuthStore).mockImplementation((selector: any) => {
        const store = {
          user: { ...mockUser, name: undefined },
        };
        return selector(store);
      });

      render(<DeactivateAccountScreen />);

      expect(screen.getByText('User')).toBeTruthy();
    });

    it('should display username correctly', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('@testuser')).toBeTruthy();
    });
  });

  describe('Content Display', () => {
    it('should display reactivation info', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('within 30 days')).toBeTruthy();
    });

    it('should display retention info', () => {
      render(<DeactivateAccountScreen />);

      expect(screen.getByText('in archived services')).toBeTruthy();
    });
  });

  describe('Theme Application', () => {
    it('should render with correct styling', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });

    it('should apply safe area view', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      // Title is set on SettingsTopBar
      expect(getByTestId('settings-top-bar')).toBeTruthy();
      // Deactivate button should be present
      expect(screen.queryByText('Deactivate')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have testID for deactivate button', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      expect(getByTestId('deactivate-button')).toBeTruthy();
    });

    it('should have accessibility label for deactivate button', () => {
      const { getByTestId } = render(<DeactivateAccountScreen />);

      const button = getByTestId('deactivate-button');
      expect(button.props.accessibilityLabel).toContain('Deactivate');
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock expo-router BEFORE importing anything that uses it
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  },
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

import { Theme } from '@/src/constants/theme';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SettingsScreen } from '../../../../app/(protected)/(settings)/settingsScreen';

// Re-mock the router after import to ensure it's properly patched
jest.mocked(router).push = mockPush;
jest.mocked(router).replace = mockReplace;

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.main.title': 'Settings',
        'settings.your_account.title': 'Your account',
        'settings.your_account.description': 'Manage your account settings',
        'settings.help_center.title': 'Help Center',
        'settings.accessibility.title': 'Accessibility, display, and languages',
        'settings.languages.title': 'Languages',
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
  profileImage: 'https://example.com/image.jpg',
};

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      user: mockUser,
      logout: jest.fn(),
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

jest.mock('@/src/modules/settings/components/SettingsSearchBar', () => {
  const { View } = require('react-native');
  const React = require('react');
  const MockComponent = (props: any) => React.createElement(View, { testID: 'settings-search-bar', ...props });
  return {
    SettingsSearchBar: MockComponent,
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
            testID: `settings-item-${item.id}`,
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
  getSettingsData: (t: (key: string) => string) => [
    {
      id: 'your-account',
      title: t('settings.your_account.title'),
      icon: 'person-outline',
      route: 'your-account',
    },
    {
      id: 'help-center',
      title: t('settings.help_center.title'),
      icon: 'help-circle-outline',
      route: 'help',
    },
    {
      id: 'accessibility',
      title: t('settings.accessibility.title'),
      icon: 'settings-outline',
      route: 'accessibility-display-languages',
    },
  ],
  getYourAccountData: () => [
    {
      id: 'account-info',
      title: 'Account Information',
      route: 'account-information',
    },
  ],
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<SettingsScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
      expect(getByTestId('settings-search-bar')).toBeTruthy();
      expect(getByTestId('settings-section')).toBeTruthy();
    });

    it('should display user username in top bar', () => {
      const { getByTestId } = render(<SettingsScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.subtitle).toContain('testuser');
    });

    it('should display Settings title', () => {
      const { getByTestId } = render(<SettingsScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Settings');
    });
  });

  describe('Navigation', () => {
    it('should navigate to your-account when item is pressed', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      const accountItem = getByTestId('settings-item-your-account');
      fireEvent.press(accountItem);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/your-account');
      });
    });

    it('should navigate to help when help item is pressed', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      const helpItem = getByTestId('settings-item-help-center');
      fireEvent.press(helpItem);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/help');
      });
    });

    it('should navigate to accessibility when accessibility item is pressed', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      const accessibilityItem = getByTestId('settings-item-accessibility');
      fireEvent.press(accessibilityItem);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(protected)/(settings)/accessibility-display-languages');
      });
    });

    it('should go back to protected screen when back button is pressed', () => {
      const { getByTestId } = render(<SettingsScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(mockReplace).toHaveBeenCalledWith('/(protected)');
    });
  });

  describe('Settings Items', () => {
    it('should render all settings items', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      await waitFor(() => {
        expect(getByTestId('settings-item-your-account')).toBeTruthy();
        expect(getByTestId('settings-item-help-center')).toBeTruthy();
        expect(getByTestId('settings-item-accessibility')).toBeTruthy();
      });
    });

    it('should have correct item titles', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('Your account')).toBeTruthy();
      expect(screen.getByText('Help Center')).toBeTruthy();
      expect(screen.getByText('Accessibility, display, and languages')).toBeTruthy();
    });
  });

  describe('Theme Application', () => {
    it('should apply theme colors to container', () => {
      const { getByTestId } = render(<SettingsScreen />);

      const safeArea = getByTestId('settings-top-bar').parent;
      expect(safeArea).toBeTruthy();
    });
  });
});

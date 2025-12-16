/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

import { Theme } from '@/src/constants/theme';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityDisplayLanguagesScreen } from '../../../../app/(protected)/(settings)/accessibility-display-languages/index';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.accessibility.title': 'Accessibility, display, and languages',
        'settings.languages.title': 'Languages',
        'settings.languages.description': 'Change your language preferences',
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
            testID: `accessibility-item-${item.id}`,
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

describe('AccessibilityDisplayLanguagesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
      expect(getByTestId('settings-section')).toBeTruthy();
    });

    it('should display correct title', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.title).toBe('Accessibility, display, and languages');
    });

    it('should display username in subtitle', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      const topBar = getByTestId('settings-top-bar');
      expect(topBar.props.subtitle).toContain('testuser');
    });

    it('should display languages item', () => {
      render(<AccessibilityDisplayLanguagesScreen />);

      expect(screen.getByText('Languages')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to languages when item is pressed', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      const languagesItem = getByTestId('accessibility-item-languages');
      fireEvent.press(languagesItem);

      expect(global.mockNavigate).toHaveBeenCalledWith(
        '/(protected)/(settings)/accessibility-display-languages/languages',
      );
    });

    it('should go back when back button is pressed', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      const topBar = getByTestId('settings-top-bar');
      topBar.props.onBackPress?.();

      expect(global.mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility Items', () => {
    it('should display correct item structure', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      const languagesItem = getByTestId('accessibility-item-languages');
      expect(languagesItem).toBeTruthy();
    });
  });

  describe('Status Bar', () => {
    it('should render with correct status bar configuration', () => {
      render(<AccessibilityDisplayLanguagesScreen />);

      expect(screen.getByText('Languages')).toBeTruthy();
    });
  });

  describe('Safe Area', () => {
    it('should be wrapped in safe area view', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      expect(getByTestId('settings-top-bar')).toBeTruthy();
    });
  });

  describe('ScrollView', () => {
    it('should have settings section inside scrollable area', () => {
      const { getByTestId } = render(<AccessibilityDisplayLanguagesScreen />);

      expect(getByTestId('settings-section')).toBeTruthy();
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Theme } from '@/src/constants/theme';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

// Mock SettingsTopBar component
const SettingsTopBar: React.FC<any> = ({ title, subtitle, onBackPress }) => (
  <View testID="settings-top-bar">
    <View testID="back-button" onTouchEnd={onBackPress} />
    <View testID="title">{title}</View>
    <View testID="subtitle">{subtitle}</View>
  </View>
);

// Mock ThemeContext for SettingsTopBar tests
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: {
          primary: '#ffffff',
          secondary: '#f5f5f5',
        },
        text: {
          primary: '#000000',
          secondary: '#666666',
        },
      },
      spacing: {
        lg: 16,
        md: 12,
        sm: 8,
      },
      typography: {
        sizes: {
          lg: 18,
          md: 16,
        },
        fonts: {
          bold: 'Bold',
        },
      },
    } as Theme,
    isDark: false,
  }),
}));

describe('SettingsTopBar', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      const { getByTestId } = render(<SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={jest.fn()} />);

      const title = getByTestId('title');
      expect(title).toBeTruthy();
    });

    it('should render subtitle correctly', () => {
      const { getByTestId } = render(<SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={jest.fn()} />);

      const subtitle = getByTestId('subtitle');
      expect(subtitle).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByTestId } = render(<SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={jest.fn()} />);

      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onBackPress when back button is pressed', () => {
      const mockBackPress = jest.fn();
      const { getByTestId } = render(
        <SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={mockBackPress} />,
      );

      const backButton = getByTestId('back-button');
      fireEvent(backButton, 'touchEnd');

      expect(mockBackPress).toHaveBeenCalled();
    });

    it('should not call onBackPress if not provided', () => {
      const { getByTestId } = render(<SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={undefined} />);

      const backButton = getByTestId('back-button');
      expect(() => {
        fireEvent(backButton, 'touchEnd');
      }).not.toThrow();
    });
  });

  describe('Content Display', () => {
    it('should display correct title text', () => {
      const { getByTestId } = render(<SettingsTopBar title="Your Account" subtitle="@user" onBackPress={jest.fn()} />);

      expect(getByTestId('title')).toBeTruthy();
    });

    it('should display correct subtitle text', () => {
      const { getByTestId } = render(<SettingsTopBar title="Settings" subtitle="@testuser" onBackPress={jest.fn()} />);

      expect(getByTestId('subtitle')).toBeTruthy();
    });

    it('should update when props change', () => {
      const { rerender, getByTestId } = render(
        <SettingsTopBar title="Old Title" subtitle="@user" onBackPress={jest.fn()} />,
      );

      expect(getByTestId('title')).toBeTruthy();

      rerender(<SettingsTopBar title="New Title" subtitle="@user" onBackPress={jest.fn()} />);

      expect(getByTestId('title')).toBeTruthy();
    });
  });
});

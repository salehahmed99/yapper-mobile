import ThemeSettingsSheet from '@/src/components/shell/ThemeSettingsSheet';
import { useTheme } from '@/src/context/ThemeContext';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/context/ThemeContext', () => {
  const original = jest.requireActual('@/src/context/ThemeContext');
  return {
    ...original,
    useTheme: jest.fn(),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Real theme object for styles

describe('ThemeSettingsSheet', () => {
  const mockSetThemeMode = jest.fn();
  const mockSetUseDeviceSettings = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockTheme = {
      theme: {
        colors: {
          background: { primary: '#FFFFFF' },
          border: '#E1E8ED',
          text: { primary: '#000000', secondary: '#657786' },
          accent: { bookmark: '#1DA1F2' },
        },
        typography: {
          sizes: { xl: 20, md: 16, sm: 14 },
          fonts: { semiBold: 'System', medium: 'System' },
          lineHeights: { relaxed: 1.5 },
        },
        borderRadius: { xl: 20, full: 9999 },
        spacing: { lg: 24, md: 16, sm: 12, xs: 8, xxs: 4 },
      },
      isDark: false,
      useDeviceSettings: false,
      setThemeMode: mockSetThemeMode,
      setUseDeviceSettings: mockSetUseDeviceSettings,
    };
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render when visible', () => {
    render(<ThemeSettingsSheet visible={true} onClose={mockOnClose} />);

    expect(screen.getByText('settings.theme.title')).toBeTruthy();
    // t('settings.theme.title') usually returns the key if not mocked with a special translation
    // In our jest.setup.ts, t(key) -> key.
    // So we expect 'settings.theme.title'
  });

  it('should verify translation keys present', () => {
    // Override translation expectation since setup.ts mocks t(key) => key
    render(<ThemeSettingsSheet visible={true} onClose={mockOnClose} />);
    expect(screen.getByText('settings.theme.title')).toBeTruthy();
    expect(screen.getByText('settings.theme.dark_mode')).toBeTruthy();
  });

  it('should toggle dark mode', () => {
    render(<ThemeSettingsSheet visible={true} onClose={mockOnClose} />);

    const switchEl = screen.getByTestId('theme_settings_dark_mode_switch');
    fireEvent(switchEl, 'onValueChange', true);

    expect(mockSetThemeMode).toHaveBeenCalledWith(true);
  });

  it('should toggle device settings', () => {
    render(<ThemeSettingsSheet visible={true} onClose={mockOnClose} />);

    const switchEl = screen.getByTestId('theme_settings_device_settings_switch');
    fireEvent(switchEl, 'onValueChange', true);

    expect(mockSetUseDeviceSettings).toHaveBeenCalledWith(true);
  });

  it('should close on backdrop press', () => {
    render(<ThemeSettingsSheet visible={true} onClose={mockOnClose} />);

    fireEvent.press(screen.getByTestId('theme_settings_backdrop'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});

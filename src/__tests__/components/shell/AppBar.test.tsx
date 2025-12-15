import AppBar from '@/src/components/shell/AppBar';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UiShellProvider, useUiShell } from '@/src/context/UiShellContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

// Mocks
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style }: { children: React.ReactNode; style: any }) =>
      React.createElement(View, { style, testID: 'blur-view' }, children),
  };
});

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 0, left: 0, right: 0 }),
}));

// Mock useUiShell to control toggles
const mockToggleSideMenu = jest.fn();
jest.mock('@/src/context/UiShellContext', () => {
  const original = jest.requireActual('@/src/context/UiShellContext');
  return {
    ...original,
    useUiShell: jest.fn(),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <UiShellProvider>{component}</UiShellProvider>
    </ThemeProvider>,
  );
};

describe('AppBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: { avatarUrl: 'http://avatar.com' } }),
    );
    (useUiShell as jest.Mock).mockReturnValue({
      toggleSideMenu: mockToggleSideMenu,
      isSideMenuOpen: false,
      appBarVisible: true,
    });
  });

  it('should render title', () => {
    renderWithProviders(<AppBar title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('should render avatar button when side menu is closed', () => {
    renderWithProviders(<AppBar />);
    const avatarBtn = screen.getByTestId('appbar_menu_button');
    expect(avatarBtn).toBeTruthy();

    fireEvent.press(avatarBtn);
    expect(mockToggleSideMenu).toHaveBeenCalled();
  });

  it('should hide avatar button when side menu is open', () => {
    (useUiShell as jest.Mock).mockReturnValue({
      toggleSideMenu: mockToggleSideMenu,
      isSideMenuOpen: true,
      appBarVisible: true,
    });
    renderWithProviders(<AppBar />);
    expect(screen.queryByTestId('appbar_menu_button')).toBeNull();
  });

  it('should render right element', () => {
    renderWithProviders(<AppBar rightElement={<View testID="right-elem">Right</View>} />);
    expect(screen.getByTestId('right-elem')).toBeTruthy();
  });

  it('should render tab view if provided', () => {
    renderWithProviders(<AppBar tabView={<View testID="tab-view">Tabs</View>} />);
    expect(screen.getByTestId('tab-view')).toBeTruthy();
  });
});

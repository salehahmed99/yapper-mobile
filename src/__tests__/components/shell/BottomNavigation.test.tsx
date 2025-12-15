import BottomNavigation from '@/src/components/shell/BottomNavigation';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UiShellProvider, useUiShell } from '@/src/context/UiShellContext';
import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

// Mocks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/src/store/useUnreadMessagesStore', () => ({
  useUnreadMessagesStore: jest.fn(),
}));

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { testID: 'blur-view' }, children),
  };
});

// Mock UiShellContext methods
const mockSetActiveTab = jest.fn();
const mockScrollY = new Animated.Value(0);

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

describe('BottomNavigation', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (usePathname as jest.Mock).mockReturnValue('/(protected)');

    (useUiShell as jest.Mock).mockReturnValue({
      activeTab: 'home',
      setActiveTab: mockSetActiveTab,
      scrollY: mockScrollY,
    });

    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ unreadChatIds: new Set() }),
    );
  });

  it('should render all tabs', () => {
    renderWithProviders(<BottomNavigation anim={new Animated.Value(0)} />);

    expect(screen.getByTestId('bottom_nav_home')).toBeTruthy();
    expect(screen.getByTestId('bottom_nav_search')).toBeTruthy();
    expect(screen.getByTestId('bottom_nav_grok')).toBeTruthy();
    expect(screen.getByTestId('bottom_nav_notifications')).toBeTruthy();
    expect(screen.getByTestId('bottom_nav_messages')).toBeTruthy();
  });

  it('should handle navigation', () => {
    renderWithProviders(<BottomNavigation anim={new Animated.Value(0)} />);

    // Press Search
    fireEvent.press(screen.getByTestId('bottom_nav_search'));

    expect(mockSetActiveTab).toHaveBeenCalledWith('search');
    expect(mockReplace).toHaveBeenCalledWith('/(protected)/explore');
  });

  it('should show unread messages badge', () => {
    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ unreadChatIds: new Set(['chat1', 'chat2']) }),
    );

    renderWithProviders(<BottomNavigation anim={new Animated.Value(0)} />);

    // Check if '2' is rendered (basic check)
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('should show 99+ for many unread messages', () => {
    const manyIds = new Set(Array.from({ length: 101 }, (_, i) => `chat${i}`));
    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ unreadChatIds: manyIds }),
    );

    renderWithProviders(<BottomNavigation anim={new Animated.Value(0)} />);

    expect(screen.getByText('99+')).toBeTruthy();
  });
});

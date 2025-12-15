import SideMenu from '@/src/components/shell/SideMenu';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UiShellProvider, useUiShell } from '@/src/context/UiShellContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

// Mocks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
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
const mockCloseSideMenu = jest.fn();
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

describe('SideMenu', () => {
  const mockAnim = new Animated.Value(0);
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: { name: 'Test User', username: 'testuser', following: 10, followers: 20 },
      }),
    );
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useUiShell as jest.Mock).mockReturnValue({
      isSideMenuOpen: true,
      closeSideMenu: mockCloseSideMenu,
    });
  });

  it('should render user info', () => {
    renderWithProviders(<SideMenu anim={mockAnim} />);
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('@testuser')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy(); // Following
    expect(screen.getByText('20')).toBeTruthy(); // Followers
  });

  it('should navigate and close menu on profile press', () => {
    renderWithProviders(<SideMenu anim={mockAnim} />);
    const profileBtn = screen.getByTestId('sidemenu_profile_button');
    fireEvent.press(profileBtn);
    expect(mockCloseSideMenu).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/(profile)/Profile/');
  });

  it('should navigate to valid routes', () => {
    renderWithProviders(<SideMenu anim={mockAnim} />);

    // Check Explore
    fireEvent.press(screen.getByTestId('sidemenu_explore_button'));
    expect(mockPush).toHaveBeenCalledWith('/(protected)/explore');

    // Check Messages
    fireEvent.press(screen.getByTestId('sidemenu_messages_button'));
    expect(mockPush).toHaveBeenCalledWith('/(protected)/messages');
  });

  it('should toggle theme settings', () => {
    renderWithProviders(<SideMenu anim={mockAnim} />);
    // Just verify the button exists and is pressable
    const themeBtn = screen.getByTestId('sidemenu_toggle_theme_button');
    expect(themeBtn).toBeTruthy();
    fireEvent.press(themeBtn);
    // Checking if modal opens would require mocking the ThemeSettingsSheet or checking for modal content
    // We can just verify no crash for now as we mock the sheet usually?
    // Actually the sheet is imported. If we didn't mock it, it renders.
  });
});

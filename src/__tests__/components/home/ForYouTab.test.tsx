import ForYouTab from '@/src/components/home/ForYouTab';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UiShellProvider, useUiShell } from '@/src/context/UiShellContext';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';

// Mocks
jest.mock('@/src/context/UiShellContext', () => {
  const original = jest.requireActual('@/src/context/UiShellContext');
  return {
    ...original,
    useUiShell: jest.fn(),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 0 }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <UiShellProvider>{component}</UiShellProvider>
    </ThemeProvider>,
  );
};

describe('ForYouTab', () => {
  const mockScrollY = new Animated.Value(0);

  beforeEach(() => {
    jest.clearAllMocks();
    (useUiShell as jest.Mock).mockReturnValue({
      scrollY: mockScrollY,
    });
  });

  it('should render content', () => {
    renderWithProviders(<ForYouTab />);

    // Check for some dummy cards
    expect(screen.getByTestId('for_you_tab_card_0')).toBeTruthy();
    expect(screen.getByTestId('for_you_tab_card_1')).toBeTruthy();
  });
});

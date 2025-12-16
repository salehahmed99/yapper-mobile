import RedirectScreen from '@/app/redirect';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// Mocks
jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => '/redirect'),
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/src/components/ActivityLoader', () => {
  const { View } = require('react-native');
  return () => <View testID="activity_loader" />;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('RedirectScreen', () => {
  jest.useFakeTimers();

  it('should redirect after timeout', async () => {
    renderWithTheme(<RedirectScreen />);

    // Fast-forward time
    jest.runAllTimers();

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(auth)/landing-screen');
    });
  });
});

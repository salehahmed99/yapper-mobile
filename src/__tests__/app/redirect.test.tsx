import RedirectScreen from '@/app/redirect';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { render, waitFor } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import React from 'react';

jest.mock('@/src/components/ActivityLoader', () => {
  const { View } = require('react-native');
  return () => <View testID="activity_loader" />;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('RedirectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/redirect');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should redirect after timeout', async () => {
    renderWithTheme(<RedirectScreen />);

    // Fast-forward time
    jest.runAllTimers();

    await waitFor(() => {
      expect(global.mockReplace).toHaveBeenCalledWith('/(auth)/landing-screen');
    });
  });
});

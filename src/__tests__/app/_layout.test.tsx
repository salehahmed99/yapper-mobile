import RootLayout from '@/app/_layout';
import { initLanguage } from '@/src/i18n';
import { render, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

// Mocks
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]), // Fonts loaded
}));

jest.mock('@/src/i18n', () => ({
  initLanguage: jest.fn(),
  default: { language: 'en' },
}));

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ initializeAuth: jest.fn() })),
}));

jest.mock('expo-router', () => ({
  Stack: jest.fn(() => null),
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

jest.mock('react-native-toast-message', () => ({
  default: () => null,
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({ children }: any) => children,
}));

describe('RootLayout', () => {
  it('should render children when ready', async () => {
    render(<RootLayout />);

    await waitFor(() => {
      expect(initLanguage).toHaveBeenCalled();
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });
});

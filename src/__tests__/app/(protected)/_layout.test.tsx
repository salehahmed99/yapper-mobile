import ProtectedLayout from '@/app/(protected)/_layout';
import { useAuthStore } from '@/src/store/useAuthStore';
import { render } from '@testing-library/react-native';
import { Redirect } from 'expo-router';
import React from 'react';

// Mocks
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/src/components/shell/AppShell', () => {
  const { View } = require('react-native');
  return () => <View testID="app_shell" />;
});

jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
}));

describe('ProtectedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if not initialized', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: false, user: null }),
    );
    const { toJSON } = render(<ProtectedLayout />);
    expect(toJSON()).toBeNull();
  });

  it('should redirect if initialized but no user', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: null }),
    );
    render(<ProtectedLayout />);
    expect(Redirect).toHaveBeenCalledWith({ href: '/(auth)/landing-screen' }, undefined);
  });

  it('should render content if authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: { id: '1' } }),
    );
    const { getByTestId } = render(<ProtectedLayout />);
    expect(getByTestId('app_shell')).toBeTruthy();
  });
});

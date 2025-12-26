import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ListsComponent from '../../components/ListsComponent';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock navigation
jest.mock('@/src/hooks/useNavigation', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock useSwipeableTabsGeneric
jest.mock('@/src/hooks/useSwipeableTabsGeneric', () => ({
  useSwipeableTabsGeneric: () => ({
    translateX: { interpolate: jest.fn(() => 0) },
    panResponder: { panHandlers: {} },
    screenWidth: 390,
  }),
}));

// Mock CustomTabView
jest.mock('@/src/components/CustomTabView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ testID }: { testID?: string }) => React.createElement(View, { testID: testID || 'custom_tab_view' }),
  };
});

// Mock UserList
jest.mock('@/src/modules/user_list/components/UserList', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ type }: { type: string }) =>
      React.createElement(View, { testID: `user_list_${type}` }, React.createElement(Text, null, type)),
  };
});

// Mock FollowButton
jest.mock('@/src/modules/user_list/components/FollowButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'follow_button' }),
  };
});

// Mock auth store
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: { id: 'current-user-id' } }),
}));

describe('ListsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tabs and routes', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent />);

    expect(getByTestId('custom_tab_view')).toBeTruthy();
  });

  it('should render following route', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent />);

    expect(getByTestId('user_list_route_following')).toBeTruthy();
  });

  it('should render followers route', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent />);

    expect(getByTestId('user_list_route_followers')).toBeTruthy();
  });

  it('should render with initial tab', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent initialTab="Followers" />);

    expect(getByTestId('custom_tab_view')).toBeTruthy();
  });

  it('should render with userId for other user profile', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent userId="other-user-id" />);

    expect(getByTestId('user_list_route_mutualFollowers')).toBeTruthy();
  });

  it('should not show mutual followers for own profile', () => {
    const { queryByTestId } = renderWithTheme(<ListsComponent userId="current-user-id" />);

    expect(queryByTestId('user_list_route_mutualFollowers')).toBeNull();
  });

  it('should render with lowercase initial tab', () => {
    const { getByTestId } = renderWithTheme(<ListsComponent initialTab="following" />);

    expect(getByTestId('custom_tab_view')).toBeTruthy();
  });
});

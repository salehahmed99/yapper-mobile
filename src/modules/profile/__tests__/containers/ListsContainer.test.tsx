import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ListsContainer from '../../containers/ListsContainer';

// Create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    tab: 'followers',
    userId: 'user-123',
    username: 'testuser',
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock auth store
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      user: { id: 'current-user-id', name: 'Current User' },
    }),
}));

// Mock ListsComponent
jest.mock('../../components/ListsComponent', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_lists_component' }),
  };
});

describe('ListsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const Wrapper = createWrapper();
    const { toJSON } = render(
      <Wrapper>
        <ListsContainer />
      </Wrapper>,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should render mocked ListsComponent', () => {
    const Wrapper = createWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <ListsContainer />
      </Wrapper>,
    );
    expect(getByTestId('mocked_lists_component')).toBeTruthy();
  });
});

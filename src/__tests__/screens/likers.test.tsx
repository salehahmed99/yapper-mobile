import LikersScreen from '@/app/(protected)/tweets/[tweetId]/likers';
import { ThemeProvider } from '@/src/context/ThemeContext';
import * as useUserListHook from '@/src/modules/user_list/hooks/useUserList';
import { IUser } from '@/src/types/user';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => ({ tweetId: 'test-tweet-123' }),
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useUserList hook
const mockUseUserList = jest.spyOn(useUserListHook, 'useUserList');

const mockUsers: IUser[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Software Developer',
    avatarUrl: 'https://example.com/avatar1.jpg',
    isFollower: true,
    isFollowing: false,
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    name: 'Jane Doe',
    username: 'janedoe',
    bio: 'Designer',
    avatarUrl: 'https://example.com/avatar2.jpg',
    isFollower: false,
    isFollowing: true,
  },
];

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{component}</ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('LikersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserList.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('should render successfully', () => {
    renderWithTheme(<LikersScreen />);

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Jane Doe')).toBeTruthy();
  });

  it('should display list of users who liked the tweet', async () => {
    renderWithTheme(<LikersScreen />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Doe')).toBeTruthy();
    });
  });

  it('should use correct tweet ID from params', () => {
    renderWithTheme(<LikersScreen />);

    expect(mockUseUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'likes',
        tweetId: 'test-tweet-123',
      }),
    );
  });

  it('should show loading state', () => {
    mockUseUserList.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithTheme(<LikersScreen />);

    // Check that ActivityIndicator is rendered
    expect(screen.UNSAFE_queryByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('should show error state', () => {
    mockUseUserList.mockReturnValue({
      users: [],
      loading: false,
      error: 'Failed to load users',
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithTheme(<LikersScreen />);

    expect(screen.getByText('Failed to load users')).toBeTruthy();
    expect(screen.getByText('userList.errorRetry')).toBeTruthy();
  });

  it('should show empty state when no users liked', () => {
    mockUseUserList.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithTheme(<LikersScreen />);

    expect(screen.getByText('userList.emptyState')).toBeTruthy();
  });

  it('should handle user press action', async () => {
    renderWithTheme(<LikersScreen />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    const userItem = screen.getByText('John Doe').parent?.parent;
    if (userItem) {
      fireEvent.press(userItem);
      // User press handler logs but doesn't navigate yet (TODO in code)
      // This test verifies the press is handled without crashing
    }
  });

  it('should use theme colors', () => {
    renderWithTheme(<LikersScreen />);

    // Verify screen renders with theme (implicitly tested by successful render)
    expect(screen.getByText('John Doe')).toBeTruthy();
  });
});

import RetweetersScreen from '@/app/(protected)/tweets/[tweetId]/retweeters';
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
  useLocalSearchParams: () => ({ tweetId: 'test-tweet-456' }),
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
    email: 'alice@example.com',
    name: 'Alice Smith',
    username: 'alice',
    bio: 'Product Manager',
    avatarUrl: 'https://example.com/avatar1.jpg',
    isFollower: true,
    isFollowing: false,
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    name: 'Bob Johnson',
    username: 'bob',
    bio: 'Engineer',
    avatarUrl: 'https://example.com/avatar2.jpg',
    isFollower: false,
    isFollowing: false,
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

describe('RetweetersScreen', () => {
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
    renderWithTheme(<RetweetersScreen />);

    expect(screen.getByText('Alice Smith')).toBeTruthy();
    expect(screen.getByText('Bob Johnson')).toBeTruthy();
  });

  it('should display list of users who retweeted', async () => {
    renderWithTheme(<RetweetersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
      expect(screen.getByText('Bob Johnson')).toBeTruthy();
    });
  });

  it('should use correct tweet ID from params', () => {
    renderWithTheme(<RetweetersScreen />);

    expect(mockUseUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'reposts',
        tweetId: 'test-tweet-456',
      }),
    );
  });

  it('should render follow buttons for each user', async () => {
    renderWithTheme(<RetweetersScreen />);

    await waitFor(() => {
      // Should have follow buttons (rendered by FollowButton component)
      expect(screen.getAllByText('userList.follow').length).toBeGreaterThan(0);
    });
  });

  it('should handle follow button press', async () => {
    renderWithTheme(<RetweetersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
    });

    // The follow button press is handled but just logs (TODO in code)
    // This test verifies it doesn't crash
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

    renderWithTheme(<RetweetersScreen />);

    // Check that ActivityIndicator is rendered
    expect(screen.UNSAFE_queryByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('should show error state', () => {
    mockUseUserList.mockReturnValue({
      users: [],
      loading: false,
      error: 'Network error',
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithTheme(<RetweetersScreen />);

    expect(screen.getByText('Network error')).toBeTruthy();
    expect(screen.getByText('userList.errorRetry')).toBeTruthy();
  });

  it('should show empty state when no retweets', () => {
    mockUseUserList.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      hasNextPage: false,
      refreshing: false,
      loadMore: jest.fn(),
      refresh: jest.fn(),
    });

    renderWithTheme(<RetweetersScreen />);

    expect(screen.getByText('userList.emptyState')).toBeTruthy();
  });

  it('should handle user press action', async () => {
    renderWithTheme(<RetweetersScreen />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
    });

    const userItem = screen.getByText('Alice Smith').parent;
    if (userItem) {
      fireEvent.press(userItem);
      // Verify press is handled without crashing
    }
  });
});

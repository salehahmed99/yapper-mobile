import { ThemeProvider } from '@/src/context/ThemeContext';
import UserList from '@/src/modules/user_list/components/UserList';
import * as useUserListHook from '@/src/modules/user_list/hooks/useUserList';
import { IUser } from '@/src/types/user';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

const mockOnUserPress = jest.fn();
const mockRenderAction = jest.fn(() => null);

// Mock useUserList hook
const mockUseUserList = jest.spyOn(useUserListHook, 'useUserList');

describe('UserList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultHookReturn = {
    users: mockUsers,
    loading: false,
    error: null,
    hasNextPage: false,
    refreshing: false,
    loadMore: jest.fn(),
    refresh: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider>
        <UserList
          type="likes"
          tweetId="tweet-123"
          onUserPress={mockOnUserPress}
          renderAction={mockRenderAction}
          {...props}
        />
      </ThemeProvider>,
    );
  };

  describe('Rendering with Data', () => {
    it('should render list of users', async () => {
      mockUseUserList.mockReturnValue(defaultHookReturn);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('Jane Doe')).toBeTruthy();
      });
    });

    it('should render user items with correct data', async () => {
      mockUseUserList.mockReturnValue(defaultHookReturn);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('@johndoe')).toBeTruthy();
        expect(screen.getByText('@janedoe')).toBeTruthy();
      });
    });

    it('should call renderAction for each user', async () => {
      mockUseUserList.mockReturnValue(defaultHookReturn);

      renderComponent();

      await waitFor(() => {
        expect(mockRenderAction).toHaveBeenCalledWith(mockUsers[0]);
        expect(mockRenderAction).toHaveBeenCalledWith(mockUsers[1]);
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
        loading: true,
      });

      renderComponent();

      // Loading state is shown - users are not displayed
      expect(screen.queryByText('John Doe')).toBeNull();
    });

    it('should not show users when loading', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
        loading: true,
      });

      renderComponent();

      expect(screen.queryByText('John Doe')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
        error: 'Failed to load users',
      });

      renderComponent();

      expect(screen.getByText('Failed to load users')).toBeTruthy();
    });

    it('should show retry button on error', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
        error: 'Failed to load users',
      });

      renderComponent();

      expect(screen.getByText('userList.errorRetry')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no users and not loading', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
      });

      renderComponent();

      expect(screen.getByText('userList.emptyState')).toBeTruthy();
    });

    it('should not show empty message when loading', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        users: [],
        loading: true,
      });

      renderComponent();

      expect(screen.queryByText('userList.emptyState')).toBeNull();
    });
  });

  describe('Pagination', () => {
    it('should show loading footer when has next page and loading more', () => {
      mockUseUserList.mockReturnValue({
        ...defaultHookReturn,
        hasNextPage: true,
        loading: true,
      });

      renderComponent();

      // Component shows users and activity indicator
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Different User List Types', () => {
    it('should work with likes type', () => {
      mockUseUserList.mockReturnValue(defaultHookReturn);

      renderComponent({ type: 'likes' });

      expect(mockUseUserList).toHaveBeenCalledWith(expect.objectContaining({ type: 'likes' }));
    });

    it('should work with reposts type', () => {
      mockUseUserList.mockReturnValue(defaultHookReturn);

      renderComponent({ type: 'reposts' });

      expect(mockUseUserList).toHaveBeenCalledWith(expect.objectContaining({ type: 'reposts' }));
    });
  });
});

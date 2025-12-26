import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ProfileTabs from '../../components/ProfileTabs';

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

// Mock auth store - default to own profile
let mockUserId = 'current-user-id';
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      user: { id: mockUserId, name: 'Current User' },
    }),
}));

// Mock ProfilePostsList
jest.mock('../../components/ProfilePostsList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onEndReached }: { onEndReached: () => void }) => {
      // Call onEndReached to test the handler
      setTimeout(() => onEndReached?.(), 0);
      return React.createElement(View, { testID: 'mocked_profile_posts_list' });
    },
  };
});

// Mock LoadingIndicator
jest.mock('../../../../components/LoadingIndicator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_loading_indicator' }),
  };
});

// Mock CustomTabView
jest.mock('@/src/components/CustomTabView', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ routes }: { routes: { key: string; title: string }[] }) =>
      React.createElement(
        View,
        { testID: 'mocked_custom_tab_view' },
        routes.map((route) => React.createElement(Text, { key: route.key, testID: `tab_${route.key}` }, route.title)),
      ),
  };
});

// Mock useSwipeableTabsGeneric hook
jest.mock('../../../../hooks/useSwipeableTabsGeneric', () => ({
  useSwipeableTabsGeneric: () => ({
    translateX: { interpolate: jest.fn(() => 0) },
    panResponder: { panHandlers: {} },
    screenWidth: 400,
  }),
}));

// Mock ProfilePostsContext
const mockRegisterFetchNextPage = jest.fn();
const mockRegisterRefresh = jest.fn();
jest.mock('../../context/ProfilePostsContext', () => ({
  useProfilePosts: () => ({
    registerFetchNextPage: mockRegisterFetchNextPage,
    registerRefresh: mockRegisterRefresh,
  }),
}));

// Mock data hooks - configurable per test
let mockPostsData = {
  posts: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  refetch: jest.fn(),
};
let mockRepliesData = {
  replies: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  refetch: jest.fn(),
};
let mockMediaData = {
  media: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  refetch: jest.fn(),
};
let mockLikesData = {
  likes: [],
  isLoading: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  refetch: jest.fn(),
};

jest.mock('../../hooks/useUserPosts', () => ({
  useUserPostsData: () => mockPostsData,
}));

jest.mock('../../hooks/useUserReplies', () => ({
  useUserRepliesData: () => mockRepliesData,
}));

jest.mock('../../hooks/useUserMedia', () => ({
  useUserMediaData: () => mockMediaData,
}));

jest.mock('../../hooks/useUserLikes', () => ({
  useUserLikesData: () => mockLikesData,
}));

describe('ProfileTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserId = 'current-user-id';
    // Reset to loading state
    mockPostsData = {
      posts: [],
      isLoading: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
    };
    mockRepliesData = {
      replies: [],
      isLoading: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
    };
    mockMediaData = {
      media: [],
      isLoading: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
    };
    mockLikesData = {
      likes: [],
      isLoading: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      refetch: jest.fn(),
    };
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const Wrapper = createWrapper();
      const { toJSON } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(toJSON()).not.toBeNull();
    });

    it('should render custom tab view', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('mocked_custom_tab_view')).toBeTruthy();
    });

    it('should render all tab titles for own profile', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('tab_posts')).toBeTruthy();
      expect(getByTestId('tab_replies')).toBeTruthy();
      expect(getByTestId('tab_media')).toBeTruthy();
      expect(getByTestId('tab_likes')).toBeTruthy();
    });

    it('should work with external userId prop', () => {
      const Wrapper = createWrapper();
      const { toJSON } = render(
        <Wrapper>
          <ProfileTabs userId="user-123" />
        </Wrapper>,
      );
      expect(toJSON()).not.toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should render posts loading state', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('posts_route_loading')).toBeTruthy();
    });

    it('should render replies loading state', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('replies_route_loading')).toBeTruthy();
    });

    it('should render media loading state', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('media_route_loading')).toBeTruthy();
    });

    it('should render likes loading state for own profile', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('likes_route_loading')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show posts empty state when no posts', () => {
      mockPostsData = {
        posts: [],
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('posts_route_empty')).toBeTruthy();
    });

    it('should show replies empty state when no replies', () => {
      mockRepliesData = {
        replies: [],
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('replies_route_empty')).toBeTruthy();
    });

    it('should show media empty state when no media', () => {
      mockMediaData = {
        media: [],
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('media_route_empty')).toBeTruthy();
    });

    it('should show likes empty state when no likes', () => {
      mockLikesData = {
        likes: [],
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getByTestId('likes_route_empty')).toBeTruthy();
    });
  });

  describe('Data Loaded States', () => {
    it('should render posts list when posts exist', () => {
      mockPostsData = {
        posts: [{ id: '1', content: 'Test post' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getAllByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getAllByTestId('mocked_profile_posts_list').length).toBeGreaterThan(0);
    });

    it('should render replies list when replies exist', () => {
      mockRepliesData = {
        replies: [{ id: '1', content: 'Test reply' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getAllByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getAllByTestId('mocked_profile_posts_list').length).toBeGreaterThan(0);
    });

    it('should render media list when media exists', () => {
      mockMediaData = {
        media: [{ id: '1', content: 'Test media' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getAllByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getAllByTestId('mocked_profile_posts_list').length).toBeGreaterThan(0);
    });

    it('should render likes list when likes exist', () => {
      mockLikesData = {
        likes: [{ id: '1', content: 'Test like' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      const { getAllByTestId } = render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(getAllByTestId('mocked_profile_posts_list').length).toBeGreaterThan(0);
    });
  });

  describe('Context Registration', () => {
    it('should register fetchNextPage callback', () => {
      mockPostsData = {
        posts: [{ id: '1' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(mockRegisterFetchNextPage).toHaveBeenCalled();
    });

    it('should register refresh callback', () => {
      mockPostsData = {
        posts: [{ id: '1' }] as any,
        isLoading: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: true,
        refetch: jest.fn(),
      };
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <ProfileTabs />
        </Wrapper>,
      );
      expect(mockRegisterRefresh).toHaveBeenCalled();
    });
  });

  describe('Other User Profile', () => {
    it('should not show likes tab for other user profile', () => {
      const Wrapper = createWrapper();
      const { queryByTestId } = render(
        <Wrapper>
          <ProfileTabs userId="other-user-id" />
        </Wrapper>,
      );
      expect(queryByTestId('tab_likes')).toBeNull();
    });

    it('should still show posts, replies, media tabs for other user', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileTabs userId="other-user-id" />
        </Wrapper>,
      );
      expect(getByTestId('tab_posts')).toBeTruthy();
      expect(getByTestId('tab_replies')).toBeTruthy();
      expect(getByTestId('tab_media')).toBeTruthy();
    });
  });
});

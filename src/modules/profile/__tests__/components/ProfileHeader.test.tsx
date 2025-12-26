import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';

// Create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@/src/hooks/useNavigation', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock chat service
const mockCreateChat = jest.fn().mockResolvedValue({ chat: { id: 'chat-123' } });
jest.mock('../../../chat/services/chatService', () => ({
  createChat: () => mockCreateChat(),
}));

// Mock auth store
const mockCurrentUser = {
  id: 'current-user-id',
  name: 'Current User',
  username: 'currentuser',
  email: 'current@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  coverUrl: 'https://example.com/banner.jpg',
  bio: 'Test bio',
  followers: 100,
  following: 50,
  createdAt: '2024-01-01',
};

const mockUpdateFollowCounts = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      user: mockCurrentUser,
      updateFollowCounts: mockUpdateFollowCounts,
    }),
}));

// Mock profile service
jest.mock('../../services/profileService', () => ({
  getUserById: jest.fn().mockResolvedValue({
    userId: 'user-123',
    name: 'Other User',
    username: 'otheruser',
    bio: 'Other bio',
    avatarUrl: 'https://example.com/other-avatar.jpg',
    coverUrl: 'https://example.com/other-banner.jpg',
    country: 'US',
    createdAt: '2024-01-01',
    followersCount: 200,
    followingCount: 100,
    isFollower: false,
    isFollowing: false,
    isMuted: false,
    isBlocked: false,
    topMutualFollowers: [],
    mutualFollowersCount: '0',
  }),
}));

// Mock useFollowUser hook
const mockToggleFollow = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useFollowUser', () => ({
  useFollowUser: () => ({
    isFollowing: false,
    isLoading: false,
    toggleFollow: mockToggleFollow,
    setIsFollowing: jest.fn(),
  }),
}));

// Mock useMuteUser hook
const mockToggleMute = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useMuteUser', () => ({
  useMuteUser: () => ({
    isMuted: false,
    isLoading: false,
    toggleMute: mockToggleMute,
    setIsMuted: jest.fn(),
  }),
}));

// Mock useBlockUser hook
const mockToggleBlock = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useBlockUser', () => ({
  useBlockUser: () => ({
    isBlocked: false,
    isLoading: false,
    toggleBlock: mockToggleBlock,
    setIsBlocked: jest.fn(),
  }),
}));

// Mock child components with props capture
let editModalProps: { visible: boolean } = { visible: false };
jest.mock('../../components/EditProfileModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { visible: boolean }) => {
      editModalProps = props;
      return React.createElement(View, { testID: 'mocked_edit_profile_modal' });
    },
  };
});

jest.mock('../../components/AvatarViewer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_avatar_viewer' }),
  };
});

jest.mock('../../components/ProfileActionsMenu', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_profile_actions_menu' }),
  };
});

jest.mock('../../components/MutualFollowers', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_mutual_followers' }),
  };
});

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    editModalProps = { visible: false };
  });

  describe('Own Profile - Container and Structure', () => {
    it('should render profile header container', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_container')).toBeTruthy();
    });

    it('should render banner button', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_banner_button')).toBeTruthy();
    });

    it('should render banner image', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_banner_image')).toBeTruthy();
    });

    it('should render avatar button', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_avatar_button')).toBeTruthy();
    });

    it('should render avatar image', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_avatar_image')).toBeTruthy();
    });

    it('should render info container', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_info_container')).toBeTruthy();
    });
  });

  describe('Own Profile - Navigation Buttons', () => {
    it('should render back button', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_back_button')).toBeTruthy();
    });

    it('should render search button', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_search_button')).toBeTruthy();
    });

    it('should call goBack when back button pressed', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      fireEvent.press(getByTestId('profile_header_back_button'));
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('should navigate to search when search button pressed', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      fireEvent.press(getByTestId('profile_header_search_button'));
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Own Profile - Edit Button', () => {
    it('should render edit button for own profile', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_edit_button')).toBeTruthy();
    });

    it('should open edit modal when edit button pressed', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      fireEvent.press(getByTestId('profile_header_edit_button'));
      expect(editModalProps.visible).toBe(true);
    });
  });

  describe('Own Profile - User Info Display', () => {
    it('should render user name', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_name')).toBeTruthy();
    });

    it('should render username', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_username')).toBeTruthy();
    });

    it('should render bio', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_bio')).toBeTruthy();
    });

    it('should render joined date', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_joined_date')).toBeTruthy();
    });
  });

  describe('Own Profile - Stats Container', () => {
    it('should render stats container', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_stats_container')).toBeTruthy();
    });

    it('should render following count', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_following_count')).toBeTruthy();
    });

    it('should render followers count', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('profile_header_followers_count')).toBeTruthy();
    });

    it('should navigate to following list when following count pressed', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      fireEvent.press(getByTestId('profile_header_following_button'));
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should navigate to followers list when followers count pressed', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      fireEvent.press(getByTestId('profile_header_followers_button'));
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Own Profile - Mocked Child Components', () => {
    it('should render mocked edit profile modal', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('mocked_edit_profile_modal')).toBeTruthy();
    });

    it('should render mocked avatar viewer', () => {
      const Wrapper = createWrapper();
      const { getByTestId } = render(
        <Wrapper>
          <ProfileHeader isOwnProfile={true} />
        </Wrapper>,
      );
      expect(getByTestId('mocked_avatar_viewer')).toBeTruthy();
    });
  });
});

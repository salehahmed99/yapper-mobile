import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import { useMediaViewerControls } from '@/src/modules/tweets/hooks/useMediaViewerControls';
import { useTweet } from '@/src/modules/tweets/hooks/useTweet';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import { useQueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

// Mock dependencies
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@/src/context/MediaViewerContext', () => ({
  useMediaViewer: jest.fn(),
}));

jest.mock('@/src/modules/tweets/hooks/useTweet', () => ({
  useTweet: jest.fn(),
}));

jest.mock('@/src/modules/tweets/hooks/useTweetActions', () => ({
  useTweetActions: jest.fn(),
}));

jest.mock('@/src/modules/tweets/hooks/useMediaViewerControls', () => ({
  useMediaViewerControls: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    // Mock implementation - just store the callback
    callback();
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-video', () => ({
  VideoView: 'VideoView',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/components/icons/BookmarkIcon', () => 'BookmarkIcon');
jest.mock('@/src/components/icons/LikeIcon', () => 'LikeIcon');
jest.mock('@/src/components/icons/ReplyIcon', () => 'ReplyIcon');
jest.mock('@/src/components/icons/RepostIcon', () => 'RepostIcon');
jest.mock('@/src/components/icons/ShareIcon', () => 'ShareIcon');
jest.mock('@/src/components/icons/ViewsIcon', () => 'ViewsIcon');

jest.mock('@/src/modules/tweets/components/CreatePostModal', () => 'CreatePostModal');

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => 'ArrowLeftIcon',
  Pause: () => 'PauseIcon',
  Play: () => 'PlayIcon',
  Volume2: () => 'Volume2Icon',
  VolumeX: () => 'VolumeXIcon',
}));

const mockTheme = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#eeeeee',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      inverse: '#ffffff',
    },
    overlayDark: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    md: 12,
    xl: 24,
  },
  borderWidth: {
    thin: 1,
  },
  typography: {
    sizes: {
      xxl: 24,
      md: 16,
      sm: 14,
    },
    fonts: {
      bold: 'bold',
      regular: 'regular',
    },
    lineHeights: {
      normal: 1.5,
    },
  },
  borderRadius: {
    lg: 8,
  },
  iconSizes: {
    sm: 20,
  },
  iconSizesAlt: {
    sm: 18,
    md: 24,
  },
  shadows: {
    sm: {},
  },
};

const mockMediaData = {
  tweetId: 'tweet1',
  mediaIndex: 0,
  images: ['https://example.com/image1.jpg'],
  videos: [] as string[],
  videoTime: 0,
};

const mockTweet = {
  id: 'tweet1',
  content: 'Test tweet',
  isLiked: false,
  isReposted: false,
  likesCount: 10,
  repostsCount: 5,
};

describe('MediaViewerModal', () => {
  const mockCloseMediaViewer = jest.fn();
  const mockOpenMediaViewer = jest.fn();
  const mockLikeMutation = { mutate: jest.fn() };
  const mockRepostMutation = { mutate: jest.fn() };
  const mockReplyToPostMutation = { mutate: jest.fn() };
  const mockPlayer = {
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    loop: true,
    muted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: mockTheme,
    });

    (useMediaViewer as jest.Mock).mockReturnValue({
      mediaData: mockMediaData,
      closeMediaViewer: mockCloseMediaViewer,
      openMediaViewer: mockOpenMediaViewer,
    });

    (useTweet as jest.Mock).mockReturnValue({
      data: mockTweet,
      isLoading: false,
      error: null,
    });

    (useTweetActions as jest.Mock).mockReturnValue({
      likeMutation: mockLikeMutation,
      repostMutation: mockRepostMutation,
      replyToPostMutation: mockReplyToPostMutation,
    });

    (useMediaViewerControls as jest.Mock).mockReturnValue({
      player: mockPlayer,
      currentTime: 0,
      duration: 100,
      isMuted: false,
      playbackSpeed: 1,
      showSpeedMenu: false,
      progressBarRef: { current: null },
      togglePlayPause: jest.fn(),
      toggleMute: jest.fn(),
      handleSpeedChange: jest.fn(),
      setShowSpeedMenu: jest.fn(),
      formatTime: (time: number) => `${time}s`,
      handleProgressBarPress: jest.fn(),
      onProgressBarTouchStart: jest.fn(),
      onProgressBarTouchMove: jest.fn(),
      onProgressBarTouchEnd: jest.fn(),
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render nothing when mediaData is null', () => {
      (useMediaViewer as jest.Mock).mockReturnValue({
        mediaData: null,
        closeMediaViewer: mockCloseMediaViewer,
      });

      const rendered = render(<MediaViewerModal />);
      expect(rendered.root == null || rendered.root).toBe(true);
    });
  });
});

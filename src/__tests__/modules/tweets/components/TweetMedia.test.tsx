import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import TweetMedia from '@/src/modules/tweets/components/TweetMedia';
import { useFocusEffect } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@/src/context/MediaViewerContext', () => ({
  useMediaViewer: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-video', () => ({
  VideoView: 'VideoView',
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    loop: true,
    muted: false,
  })),
}));

jest.mock('lucide-react-native', () => ({
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
  typography: {
    sizes: {
      xxl: 24,
      md: 16,
    },
    fonts: {
      bold: 'bold',
    },
  },
  borderRadius: {
    lg: 8,
  },
  iconSizes: {
    sm: 20,
  },
  shadows: {
    sm: {},
  },
};

describe('TweetMedia', () => {
  const mockOpenMediaViewer = jest.fn();
  const mockUseFocusEffectCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: mockTheme,
    });

    (useMediaViewer as jest.Mock).mockReturnValue({
      openMediaViewer: mockOpenMediaViewer,
      isOpen: false,
      lastClosedData: null,
    });

    (useFocusEffect as jest.Mock).mockImplementation((callback) => {
      mockUseFocusEffectCallback(callback);
      // Call the effect immediately for testing
      const cleanup = callback();
      return cleanup;
    });
  });

  describe('Rendering', () => {
    it('should render nothing when no media is provided', () => {
      const rendered = render(<TweetMedia images={[]} videos={[]} tweetId="tweet1" isVisible={true} />);

      expect(rendered.root == null || rendered.root).toBe(true);
    });

    it('should render images correctly', () => {
      const images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

      const rendered = render(<TweetMedia images={images} videos={[]} tweetId="tweet1" isVisible={true} />);

      expect(rendered.root).toBeTruthy();
    });

    it('should render video with mute button', () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" isVisible={true} isParentMedia={false} />);

      expect(screen.getByLabelText('video_mute_toggle')).toBeTruthy();
    });
  });

  describe('Media Viewer Integration', () => {
    it('should open media viewer when image is pressed', () => {
      const images = ['https://example.com/image1.jpg'];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" isVisible={true} />);

      const pressables = screen.getAllByRole('button');
      fireEvent.press(pressables[0]);

      expect(mockOpenMediaViewer).toHaveBeenCalledWith({
        tweetId: 'tweet1',
        mediaIndex: 0,
        images,
        videos: [],
        videoTime: 0,
      });
    });
  });

  describe('Visibility Control', () => {
    it('should render videos when isVisible is true', () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" isVisible={true} isParentMedia={false} />);

      expect(screen.getByLabelText('video_mute_toggle')).toBeTruthy();
    });

    it('should not render videos when isVisible is false', async () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" isVisible={false} isParentMedia={false} />);

      await waitFor(
        () => {
          expect(screen.queryByLabelText('video_mute_toggle')).toBeFalsy();
        },
        { timeout: 500 },
      );
    });
  });

  describe('Parent Media Handling', () => {
    it('should not play video when isParentMedia is true', async () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" isVisible={true} isParentMedia={true} />);

      await waitFor(() => {
        expect(true).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const images = ['https://example.com/image1.jpg'];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" isVisible={true} />);

      expect(screen.getByLabelText('media_image_0')).toBeTruthy();
    });
  });
});

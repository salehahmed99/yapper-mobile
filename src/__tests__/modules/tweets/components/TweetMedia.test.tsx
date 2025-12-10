import { useMediaViewer } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import TweetMedia from '@/src/modules/tweets/components/TweetMedia';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@/src/context/MediaViewerContext', () => ({
  useMediaViewer: jest.fn(),
}));

jest.mock('expo-image', () => {
  const React = require('react');
  const MockImage = (props: any) => React.createElement('Image', props);
  MockImage.prefetch = jest.fn();
  return { Image: MockImage };
});

jest.mock('lucide-react-native', () => ({
  Play: () => 'PlayIcon',
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
    lg: 28,
  },
  shadows: {
    sm: {},
  },
};

describe('TweetMedia', () => {
  const mockOpenMediaViewer = jest.fn();

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
  });

  describe('Rendering', () => {
    it('should render nothing when no media is provided', () => {
      const { toJSON } = render(<TweetMedia images={[]} videos={[]} tweetId="tweet1" />);
      expect(toJSON()).toBeNull();
    });

    it('should render images correctly', () => {
      const images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

      expect(screen.getByLabelText('media_image_0')).toBeTruthy();
      expect(screen.getByLabelText('media_image_1')).toBeTruthy();
    });

    it('should render video thumbnails with play icon overlay', () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" />);

      // Video should render as thumbnail with play icon
      expect(screen.getByLabelText('media_video_0')).toBeTruthy();
      expect(screen.getByLabelText('play_icon_0')).toBeTruthy();
    });

    it('should render mixed media correctly', () => {
      const images = ['https://example.com/image1.jpg'];
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={images} videos={videos} tweetId="tweet1" />);

      expect(screen.getByLabelText('media_image_0')).toBeTruthy();
      expect(screen.getByLabelText('media_video_1')).toBeTruthy();
    });
  });

  describe('Media Viewer Integration', () => {
    it('should open media viewer when image is pressed', () => {
      const images = ['https://example.com/image1.jpg'];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

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

    it('should open media viewer when video thumbnail is pressed', () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" />);

      const pressables = screen.getAllByRole('button');
      fireEvent.press(pressables[0]);

      expect(mockOpenMediaViewer).toHaveBeenCalledWith({
        tweetId: 'tweet1',
        mediaIndex: 0,
        images: [],
        videos,
        videoTime: 0,
      });
    });

    it('should pass correct media index for multiple images', () => {
      const images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

      const pressables = screen.getAllByRole('button');
      fireEvent.press(pressables[1]); // Press second image

      expect(mockOpenMediaViewer).toHaveBeenCalledWith({
        tweetId: 'tweet1',
        mediaIndex: 1,
        images,
        videos: [],
        videoTime: 0,
      });
    });
  });

  describe('Media Grid Layout', () => {
    it('should limit to 4 media items max', () => {
      const images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg',
        'https://example.com/image5.jpg', // This should not be rendered
      ];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

      expect(screen.getByLabelText('media_image_0')).toBeTruthy();
      expect(screen.getByLabelText('media_image_1')).toBeTruthy();
      expect(screen.getByLabelText('media_image_2')).toBeTruthy();
      expect(screen.getByLabelText('media_image_3')).toBeTruthy();
      expect(screen.queryByLabelText('media_image_4')).toBeNull();
    });

    it('should show remaining count overlay when more than 4 items', () => {
      const images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg',
        'https://example.com/image5.jpg',
      ];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

      expect(screen.getByText('+1')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for images', () => {
      const images = ['https://example.com/image1.jpg'];

      render(<TweetMedia images={images} videos={[]} tweetId="tweet1" />);

      expect(screen.getByLabelText('media_image_0')).toBeTruthy();
    });

    it('should have proper accessibility labels for videos', () => {
      const videos = ['https://example.com/video1.mp4'];

      render(<TweetMedia images={[]} videos={videos} tweetId="tweet1" />);

      expect(screen.getByLabelText('media_video_0')).toBeTruthy();
      expect(screen.getByLabelText('play_icon_0')).toBeTruthy();
    });
  });
});

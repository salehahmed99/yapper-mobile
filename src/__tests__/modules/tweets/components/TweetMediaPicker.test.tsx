import { useTheme } from '@/src/context/ThemeContext';
import TweetMediaPicker from '@/src/modules/tweets/components/TweetMediaPicker';
import { MediaAsset } from '@/src/modules/tweets/utils/tweetMediaPicker.utils';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('lucide-react-native', () => ({
  Play: () => 'PlayIcon',
  X: () => 'XIcon',
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
    border: '#dddddd',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  sizes: {
    avatar: {
      lg: 60,
      md: 48,
      sm: 32,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  borderWidth: {
    thin: 1,
    medium: 2,
  },
};

const createMediaAsset = (uri: string, type: 'image' | 'video', mimeType?: string): MediaAsset => ({
  uri,
  type,
  mimeType: mimeType || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
});

describe('TweetMediaPicker', () => {
  const mockOnRemoveMedia = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: mockTheme,
    });
  });

  describe('Rendering', () => {
    it('should render nothing when media array is empty', () => {
      const rendered = render(<TweetMediaPicker media={[]} onRemoveMedia={mockOnRemoveMedia} />);

      expect(rendered.root == null || rendered.root).toBe(true);
    });

    it('should render container when media is provided', () => {
      const media = [createMediaAsset('https://example.com/image1.jpg', 'image')];

      const rendered = render(<TweetMediaPicker media={media} onRemoveMedia={mockOnRemoveMedia} />);

      expect(rendered.root).toBeTruthy();
    });
  });

  describe('Media Removal', () => {
    it('should call onRemoveMedia with correct index', () => {
      const media = [
        createMediaAsset('https://example.com/image1.jpg', 'image'),
        createMediaAsset('https://example.com/image2.jpg', 'image'),
      ];

      render(<TweetMediaPicker media={media} onRemoveMedia={mockOnRemoveMedia} />);

      const removeButton = screen.getByLabelText('remove_media_0');
      fireEvent.press(removeButton);

      expect(mockOnRemoveMedia).toHaveBeenCalledWith(0);
    });

    it('should have remove button for each media item', () => {
      const media = [
        createMediaAsset('https://example.com/image1.jpg', 'image'),
        createMediaAsset('https://example.com/image2.jpg', 'image'),
      ];

      render(<TweetMediaPicker media={media} onRemoveMedia={mockOnRemoveMedia} />);

      expect(screen.getByLabelText('remove_media_0')).toBeTruthy();
      expect(screen.getByLabelText('remove_media_1')).toBeTruthy();
    });
  });

  describe('Media Types', () => {
    it('should render images and videos', () => {
      const media = [
        createMediaAsset('https://example.com/image1.jpg', 'image'),
        createMediaAsset('https://example.com/video1.mp4', 'video'),
      ];

      const rendered = render(<TweetMediaPicker media={media} onRemoveMedia={mockOnRemoveMedia} />);

      expect(rendered.root).toBeTruthy();
    });
  });

  describe('Updates', () => {
    it('should update when media prop changes', () => {
      const media1 = [createMediaAsset('https://example.com/image1.jpg', 'image')];

      const { rerender } = render(<TweetMediaPicker media={media1} onRemoveMedia={mockOnRemoveMedia} />);

      const media2 = [
        createMediaAsset('https://example.com/image1.jpg', 'image'),
        createMediaAsset('https://example.com/image2.jpg', 'image'),
      ];

      rerender(<TweetMediaPicker media={media2} onRemoveMedia={mockOnRemoveMedia} />);

      expect(screen.getByLabelText('remove_media_1')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility labels on remove buttons', () => {
      const media = [createMediaAsset('https://example.com/image1.jpg', 'image')];

      render(<TweetMediaPicker media={media} onRemoveMedia={mockOnRemoveMedia} />);

      expect(screen.getByLabelText('remove_media_0')).toBeTruthy();
    });
  });
});

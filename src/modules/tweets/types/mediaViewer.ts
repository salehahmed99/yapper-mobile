import { Theme } from '@/src/constants/theme';

/**
 * Represents a media item (image or video) in the media viewer
 */
export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  index: number;
};

/**
 * Props for opening the media viewer
 */
export type MediaViewerData = {
  tweetId: string;
  mediaIndex: number;
  images: string[];
  videos: string[];
  videoTime?: number;
};

/**
 * Props for the MediaViewerContent component
 */
export type MediaViewerContentProps = MediaViewerData & {
  onClose: (videoTime?: number) => void;
  theme: Theme;
};

/**
 * Playback speed type - one of the supported speeds
 */
export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

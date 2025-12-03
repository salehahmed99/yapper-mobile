import { Theme } from '@/src/constants/theme';
import { ITweet } from './index';

export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  index: number;
};

export type MediaViewerData = {
  tweetId: string;
  tweet: ITweet;
  mediaIndex: number;
  images: string[];
  videos: string[];
  videoTime?: number;
};

export type MediaViewerContentProps = MediaViewerData & {
  onClose: (videoTime?: number) => void;
  theme: Theme;
};

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

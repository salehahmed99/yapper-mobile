import React, { createContext, useContext, useState } from 'react';

type MediaViewerData = {
  tweetId: string;
  mediaIndex: number;
  images: string[];
  videos: string[];
  videoTime?: number;
} | null;

type MediaViewerContextType = {
  mediaData: MediaViewerData;
  isOpen: boolean;
  lastClosedData: { tweetId: string; videoTime: number; mediaIndex: number } | null;
  openMediaViewer: (data: MediaViewerData) => void;
  closeMediaViewer: (videoTime?: number) => void;
};

const MediaViewerContext = createContext<MediaViewerContextType | undefined>(undefined);

export const MediaViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaData, setMediaData] = useState<MediaViewerData>(null);
  const [lastClosedData, setLastClosedData] = useState<{
    tweetId: string;
    videoTime: number;
    mediaIndex: number;
  } | null>(null);
  const isOpen = mediaData !== null;

  const openMediaViewer = (data: MediaViewerData) => {
    setMediaData(data);
  };

  const closeMediaViewer = (videoTime?: number) => {
    if (mediaData && videoTime !== undefined) {
      setLastClosedData({
        tweetId: mediaData.tweetId,
        videoTime,
        mediaIndex: mediaData.mediaIndex,
      });
    }
    setMediaData(null);
  };

  return (
    <MediaViewerContext.Provider value={{ mediaData, isOpen, lastClosedData, openMediaViewer, closeMediaViewer }}>
      {children}
    </MediaViewerContext.Provider>
  );
};

export const useMediaViewer = () => {
  const context = useContext(MediaViewerContext);
  if (!context) {
    throw new Error('useMediaViewer must be used within MediaViewerProvider');
  }
  return context;
};

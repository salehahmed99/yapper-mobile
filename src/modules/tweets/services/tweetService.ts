import api from '@/src/services/apiClient';
import { IQuotesResponse, ISingleTweetResponse, ITweet, ITweetFilters, ITweets, ITweetsResponse } from '../types';

/**
 * Upload a single image file
 * @param fileUri - Local file URI (e.g., file:///path/to/image.jpg)
 * @returns URL of the uploaded image
 */
export const uploadImage = async (fileUri: string): Promise<string> => {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'image.jpg';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type: 'image/jpeg',
  } as any);

  interface ImageUploadResponse {
    data: {
      url: string;
      filename: string;
      size: number;
      mime_type: string;
    };
    count: number;
    message: string;
  }

  const response = await api.post<ImageUploadResponse>('/tweets/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

/**
 * Upload a single video file
 * @param fileUri - Local file URI (e.g., file:///path/to/video.mp4)
 * @returns URL of the uploaded video
 */
export const uploadVideo = async (fileUri: string): Promise<string> => {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'video.mp4';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type: 'video/mp4',
  } as any);

  interface VideoUploadResponse {
    data: {
      url: string;
      filename: string;
      size: number;
      mime_type: string;
    };
    count: number;
    message: string;
  }

  const response = await api.post<VideoUploadResponse>('/tweets/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

/**
 * Upload multiple media files (images and videos)
 * @param mediaUris - Array of local file URIs
 * @returns Object with separate arrays of uploaded image and video URLs
 */
export const uploadMediaFiles = async (mediaUris: string[]): Promise<{ images: string[]; videos: string[] }> => {
  const images: string[] = [];
  const videos: string[] = [];

  for (const uri of mediaUris) {
    try {
      const isVideo = uri.endsWith('.mp4');
      if (isVideo) {
        const videoUrl = await uploadVideo(uri);
        videos.push(videoUrl);
      } else {
        const imageUrl = await uploadImage(uri);
        images.push(imageUrl);
      }
    } catch (error) {
      console.error('Error uploading media:', uri, error);
      throw error;
    }
  }

  return { images, videos };
};

export const getForYou = async (tweetFilters: ITweetFilters): Promise<ITweets> => {
  const response = await api.get<ITweetsResponse>('/timeline/for-you', {
    params: tweetFilters,
  });
  return response.data.data;
};
export const getFollowing = async (tweetFilters: ITweetFilters): Promise<ITweets> => {
  const response = await api.get<ITweetsResponse>('/timeline/following', {
    params: tweetFilters,
  });
  return response.data.data;
};
export const getTweetById = async (tweetId: string): Promise<ITweet> => {
  const response = await api.get<ISingleTweetResponse>(`/tweets/${tweetId}`);
  return response.data.data;
};

export const likeTweet = async (tweetId: string): Promise<void> => {
  await api.post(`/tweets/${tweetId}/like`);
};

export const unlikeTweet = async (tweetId: string): Promise<void> => {
  await api.delete(`/tweets/${tweetId}/like`);
};

export const repostTweet = async (tweetId: string): Promise<void> => {
  await api.post(`/tweets/${tweetId}/repost`);
};

export const undoRepostTweet = async (tweetId: string): Promise<void> => {
  await api.delete(`/tweets/${tweetId}/repost`);
};

export const createTweet = async (content: string, mediaUris?: string[]): Promise<ITweet> => {
  let images: string[] = [];
  let videos: string[] = [];

  // Upload media files first if provided
  if (mediaUris && mediaUris.length > 0) {
    const uploaded = await uploadMediaFiles(mediaUris);
    images = uploaded.images;
    videos = uploaded.videos;
  }

  const payload: any = {
    content,
  };

  if (images.length > 0) {
    payload.images = images;
  }

  if (videos.length > 0) {
    payload.videos = videos;
  }

  const response = await api.post<ISingleTweetResponse>('/tweets', payload);
  return response.data.data;
};

export const deleteTweet = async (tweetId: string): Promise<void> => {
  await api.delete(`/tweets/${tweetId}`);
};

export const bookmarkTweet = async (tweetId: string): Promise<void> => {
  await api.post(`/tweets/${tweetId}/bookmark`);
};

export const unbookmarkTweet = async (tweetId: string): Promise<void> => {
  await api.delete(`/tweets/${tweetId}/bookmark`);
};

export const replyToTweet = async (tweetId: string, content: string, mediaUris?: string[]): Promise<ITweet> => {
  let images: string[] = [];
  let videos: string[] = [];

  // Upload media files first if provided
  if (mediaUris && mediaUris.length > 0) {
    const uploaded = await uploadMediaFiles(mediaUris);
    images = uploaded.images;
    videos = uploaded.videos;
  }

  const payload: any = {
    content,
  };

  if (images.length > 0) {
    payload.images = images;
  }

  if (videos.length > 0) {
    payload.videos = videos;
  }

  const response = await api.post<ISingleTweetResponse>(`/tweets/${tweetId}/reply`, payload);
  return response.data.data;
};

export const quoteTweet = async (tweetId: string, content: string, mediaUris?: string[]): Promise<ITweet> => {
  let images: string[] = [];
  let videos: string[] = [];

  // Upload media files first if provided
  if (mediaUris && mediaUris.length > 0) {
    const uploaded = await uploadMediaFiles(mediaUris);
    images = uploaded.images;
    videos = uploaded.videos;
  }

  const payload: any = {
    content,
  };

  if (images.length > 0) {
    payload.images = images;
  }

  if (videos.length > 0) {
    payload.videos = videos;
  }

  const response = await api.post<ISingleTweetResponse>(`/tweets/${tweetId}/quote`, payload);
  return response.data.data;
};

export const getTweetQuotes = async (
  tweetId: string,
  filters: { cursor?: string; limit?: number } = {},
): Promise<IQuotesResponse> => {
  const response = await api.get<{ data: IQuotesResponse }>(`/tweets/${tweetId}/quotes`, {
    params: filters,
  });
  return response.data.data;
};

import api from '@/src/services/apiClient';
import { ISingleTweetResponse, ITweet, ITweetFilters, ITweets, ITweetsResponse } from '../types';

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

export const createTweet = async (content: string): Promise<ITweet> => {
  const response = await api.post<ISingleTweetResponse>('/tweets', {
    content,
  });
  return response.data.data;
};

export const deleteTweet = async (tweetId: string): Promise<void> => {
  await api.delete(`/tweets/${tweetId}`);
};

export const replyToTweet = async (tweetId: string, content: string): Promise<ITweet> => {
  const response = await api.post<ISingleTweetResponse>(`/tweets/${tweetId}/reply`, {
    content,
  });
  return response.data.data;
};

export const quoteTweet = async (tweetId: string, content: string): Promise<ITweet> => {
  const response = await api.post<ISingleTweetResponse>(`/tweets/${tweetId}/quote`, {
    content,
  });
  return response.data.data;
};

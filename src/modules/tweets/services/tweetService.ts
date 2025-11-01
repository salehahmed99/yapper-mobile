import api from '@/src/services/apiClient';
import { ISingleTweetResponse, ITweet, ITweetFilters, ITweetsResponse } from '../types';

export const getTweets = async (tweetFilters: ITweetFilters): Promise<ITweet[]> => {
  const response = await api.get<ITweetsResponse>('/tweets', {
    params: tweetFilters,
  });
  return response.data.data.data;
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

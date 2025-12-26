import api from '@/src/services/apiClient';
import { ICategoryTweetsResponse, IExploreResponse, ITrendListResponse, IWhoToFollowResponse } from '../types';

export const getTrends = async (category?: string): Promise<ITrendListResponse> => {
  const response = await api.get<ITrendListResponse>('/trend', {
    params: category ? { category } : undefined,
  });
  return response.data;
};

export const getExploreData = async (): Promise<IExploreResponse> => {
  const response = await api.get<IExploreResponse>('/explore');
  return response.data;
};

export const getWhoToFollow = async (): Promise<IWhoToFollowResponse> => {
  const response = await api.get<IWhoToFollowResponse>('/explore/who-to-follow');
  return response.data;
};

export const getCategoryTweets = async (
  categoryId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ICategoryTweetsResponse> => {
  const response = await api.get<ICategoryTweetsResponse>(`/explore/category/${categoryId}`, {
    params: { page, limit, category_id: categoryId },
  });
  return response.data;
};

import api from '@/src/services/apiClient';
import { FetchUserListParams, IUserListResponse } from '../types';

export const getUserList = async ({ tweetId, type, cursor }: FetchUserListParams) => {
  const response = await api.get<IUserListResponse>(`/tweets/${tweetId}/${type}`, {
    params: cursor ? { cursor } : undefined,
  });
  return response.data;
};

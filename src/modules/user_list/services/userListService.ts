import api from '@/src/services/apiClient';
import { FetchUserListParams, IUserListResponse } from '../types';

export const getUserList = async (params: FetchUserListParams): Promise<IUserListResponse> => {
  const { page, type } = params;

  let endpoint: string;

  if ('tweetId' in params) {
    endpoint = `/tweets/${params.tweetId}/${type}`;
  } else if ('userId' in params) {
    endpoint = `/users/${params.userId}/${type}`;
  } else {
    throw new Error('Invalid parameters: missing tweetId or userId');
  }

  const response = await api.get<IUserListResponse>(endpoint, {
    params: page ? { page } : { page: 1 },
  });

  return response.data;
};

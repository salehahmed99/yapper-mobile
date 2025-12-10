import api from '@/src/services/apiClient';
import {
  ISearchLatestPostsParams,
  ISearchPostsParams,
  ISearchPostsResponse,
  ISearchSuggestionsParams,
  ISearchSuggestionsResponse,
  ISearchUsersParams,
  ISearchUsersResponse,
} from '../types';

export const getSearchSuggestions = async (params: ISearchSuggestionsParams): Promise<ISearchSuggestionsResponse> => {
  const response = await api.get<ISearchSuggestionsResponse>('/search/suggestions', {
    params: {
      query: params.query,
      ...(params.username && { username: params.username }),
    },
  });
  return response.data;
};

export const searchPosts = async (params: ISearchPostsParams): Promise<ISearchPostsResponse> => {
  const response = await api.get<ISearchPostsResponse>('/search/posts', {
    params: {
      query: params.query,
      ...(params.username && { username: params.username }),
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.limit && { limit: params.limit }),
      ...(params.hasMedia && { hasMedia: params.hasMedia }),
    },
  });
  return response.data;
};

export const searchLatestPosts = async (params: ISearchLatestPostsParams): Promise<ISearchPostsResponse> => {
  const response = await api.get<ISearchPostsResponse>('/search/posts/latest', {
    params: {
      query: params.query,
      ...(params.username && { username: params.username }),
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.limit && { limit: params.limit }),
    },
  });
  return response.data;
};

export const searchUsers = async (params: ISearchUsersParams): Promise<ISearchUsersResponse> => {
  const response = await api.get<ISearchUsersResponse>('/search/users', {
    params: {
      query: params.query,
      ...(params.username && { username: params.username }),
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.limit && { limit: params.limit }),
    },
  });
  return response.data;
};

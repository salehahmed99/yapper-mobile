export const PROFILE_QUERY_CONFIG = {
  userProfile: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  tweets: {
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  },

  socialLists: {
    staleTime: 3 * 60 * 1000,
    gcTime: 7 * 60 * 1000,
  },

  pagination: {
    defaultLimit: 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    maxPages: 5,
  },
} as const;

export const profileQueryKeys = {
  all: ['profile'] as const,

  user: (userId?: string) => [...profileQueryKeys.all, 'user', userId] as const,
  userById: (userId: string) => [...profileQueryKeys.user(userId), 'details'] as const,

  tweets: (userId?: string) => [...profileQueryKeys.all, 'tweets', userId] as const,
  userPosts: (userId: string) => [...profileQueryKeys.tweets(userId), 'posts'] as const,
  userLikes: (userId: string) => [...profileQueryKeys.tweets(userId), 'likes'] as const,
  userMedia: (userId: string) => [...profileQueryKeys.tweets(userId), 'media'] as const,
  userReplies: (userId: string) => [...profileQueryKeys.tweets(userId), 'replies'] as const,

  social: (userId?: string) => [...profileQueryKeys.all, 'social', userId] as const,
  followers: (userId: string) => [...profileQueryKeys.social(userId), 'followers'] as const,
  following: (userId: string) => [...profileQueryKeys.social(userId), 'following'] as const,
} as const;

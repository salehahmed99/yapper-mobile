export const PROFILE_QUERY_CONFIG = {
  // Cache user profile data for 5 minutes
  userProfile: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  // Cache tweets/posts data for 2 minutes (more dynamic content)
  tweets: {
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  },

  // Cache follower/following lists for 3 minutes
  socialLists: {
    staleTime: 3 * 60 * 1000,
    gcTime: 7 * 60 * 1000,
  },

  // Pagination settings
  pagination: {
    defaultLimit: 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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

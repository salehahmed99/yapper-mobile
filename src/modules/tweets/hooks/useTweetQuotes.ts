import { useInfiniteQuery } from '@tanstack/react-query';
import { getTweetQuotes } from '../services/tweetService';
import { ITweet } from '../types';

export const useTweetQuotes = (tweetId: string) => {
  return useInfiniteQuery({
    queryKey: ['tweet-quotes', tweetId],
    queryFn: async ({ pageParam }) => {
      const response = await getTweetQuotes(tweetId, { cursor: pageParam });

      const enrichedData = response.data.map((quote: any) => {
        if (response.parent) {
          return {
            ...quote,
            parentTweet: {
              tweetId: response.parent.tweetId,
              type: response.parent.type,
              content: response.parent.content,
              images: response.parent.images || [],
              videos: response.parent.videos || [],
              likesCount: response.parent.numLikes,
              repostsCount: response.parent.numReposts,
              viewsCount: response.parent.numViews,
              quotesCount: response.parent.numQuotes,
              repliesCount: response.parent.numReplies,
              isLiked: false,
              isReposted: false,
              createdAt: response.parent.createdAt,
              updatedAt: response.parent.updatedAt,
              user: {
                id: response.parent.userId,
                name: response.parent.user.name,
                username: response.parent.user.username,
                avatarUrl: response.parent.user.avatarUrl,
              },
            } as ITweet,
          };
        }
        return quote;
      });

      return {
        ...response,
        data: enrichedData,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!tweetId,
  });
};

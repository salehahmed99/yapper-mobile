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
              tweetId: response.parent.tweet_id,
              type: response.parent.type,
              content: response.parent.content,
              images: response.parent.images || [],
              videos: response.parent.videos || [],
              likesCount: response.parent.num_likes,
              repostsCount: response.parent.num_reposts,
              viewsCount: response.parent.num_views,
              quotesCount: response.parent.num_quotes,
              repliesCount: response.parent.num_replies,
              isLiked: false,
              isReposted: false,
              createdAt: response.parent.created_at,
              updatedAt: response.parent.updated_at,
              user: {
                id: response.parent.user_id,
                name: '',
                username: '',
                avatarUrl: '',
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
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!tweetId,
  });
};

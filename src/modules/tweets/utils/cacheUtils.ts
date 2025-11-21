import { InfiniteData } from '@tanstack/react-query';
import { ITweet, ITweets } from '../types';

export const updateTweetsInInfiniteCache = (
  oldData: InfiniteData<ITweets> | undefined,
  tweetId: string,
  updater: (tweet: ITweet) => ITweet,
) => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page: ITweets) => {
      // Handle profile endpoints structure: { data: { data: [], pagination: {} }, count, message }
      if (
        'data' in page &&
        page.data &&
        typeof page.data === 'object' &&
        'data' in page.data &&
        Array.isArray(page.data.data)
      ) {
        return {
          ...page,
          data: {
            ...page.data,
            data: page.data.data.map((tweet: ITweet) => {
              if (tweet.tweetId === tweetId) {
                return updater(tweet);
              }
              return tweet;
            }),
          },
        };
      }
      // Handle home feed structure: { data: [], pagination: {} }
      if (Array.isArray(page.data)) {
        return {
          ...page,
          data: page.data.map((tweet: ITweet) => {
            if (tweet.tweetId === tweetId) {
              return updater(tweet);
            }
            return tweet;
          }),
        };
      }
      return page;
    }),
  };
};

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
    pages: oldData.pages.map((page: ITweets) => ({
      ...page,
      tweets: page.tweets.map((tweet: ITweet) => {
        if (tweet.tweetId === tweetId) {
          return updater(tweet);
        }
        return tweet;
      }),
    })),
  };
};

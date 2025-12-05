import { InfiniteData } from '@tanstack/react-query';
import { ITweet, ITweets } from '../../tweets/types';

export const updateUserStateInTweetsCache = (
  oldData: InfiniteData<ITweets> | undefined,
  userId: string,
  updater: (tweet: ITweet) => ITweet,
) => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page: ITweets) => ({
      ...page,
      data: page.data.map((tweet: ITweet) => {
        if (tweet.user.id === userId) {
          return updater(tweet);
        }
        return tweet;
      }),
    })),
  };
};

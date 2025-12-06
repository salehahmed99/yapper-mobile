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
            if (tweet.replies && Array.isArray(tweet.replies)) {
              tweet.replies = tweet.replies.map((reply: ITweet) => {
                if (reply.tweetId === tweetId) {
                  return updater(reply);
                }
                return reply;
              });
            }
            if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
              tweet.conversationTweet = updater(tweet.conversationTweet);
            }
            if (tweet.parentTweet && tweet.parentTweet.tweetId === tweetId) {
              tweet.parentTweet = updater(tweet.parentTweet);
            }
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

export const removeTweetFromInfiniteCache = (oldData: InfiniteData<ITweets> | undefined, tweetId: string) => {
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
            data: page.data.data.filter((tweet: ITweet) => tweet.tweetId !== tweetId),
          },
        };
      }
      // Handle home feed structure: { data: [], pagination: {} }
      if (Array.isArray(page.data)) {
        return {
          ...page,
          data: page.data.filter((tweet: ITweet) => {
            if (tweet.replies && Array.isArray(tweet.replies)) {
              tweet.replies = tweet.replies.filter((reply: ITweet) => reply.tweetId !== tweetId);
            }
            if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
              tweet.conversationTweet = undefined;
            }
            if (tweet.parentTweet && tweet.parentTweet.tweetId === tweetId) {
              tweet.parentTweet = undefined;
            }
            return tweet.tweetId !== tweetId;
          }),
        };
      }
      return page;
    }),
  };
};

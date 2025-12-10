import { ICategoryTweetsResponse, IExploreResponse } from '@/src/modules/explore/types';
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
      data: page.data.map((tweet: ITweet) => {
        let updatedTweet = tweet;

        if (tweet.tweetId === tweetId) {
          updatedTweet = updater(tweet);
        }

        if (tweet.replies && Array.isArray(tweet.replies)) {
          const updatedReplies = tweet.replies.map((reply: ITweet) =>
            reply.tweetId === tweetId ? updater(reply) : reply,
          );
          if (updatedReplies !== tweet.replies) {
            updatedTweet = { ...updatedTweet, replies: updatedReplies };
          }
        }

        if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
          updatedTweet = { ...updatedTweet, conversationTweet: updater(tweet.conversationTweet) };
        }

        if (tweet.parentTweet && tweet.parentTweet.tweetId === tweetId) {
          updatedTweet = { ...updatedTweet, parentTweet: updater(tweet.parentTweet) };
        }

        return updatedTweet;
      }),
    })),
  };
};

export const removeTweetFromInfiniteCache = (oldData: InfiniteData<ITweets> | undefined, tweetId: string) => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page: ITweets) => ({
      ...page,
      data: page.data
        .map((tweet: ITweet) => {
          let updatedTweet = tweet;
          if (tweet.replies && Array.isArray(tweet.replies)) {
            const filteredReplies = tweet.replies.filter((reply: ITweet) => reply.tweetId !== tweetId);
            if (filteredReplies.length !== tweet.replies.length) {
              updatedTweet = { ...updatedTweet, replies: filteredReplies };
            }
          }

          if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
            updatedTweet = { ...updatedTweet, conversationTweet: undefined };
          }
          if (tweet.parentTweet && tweet.parentTweet.tweetId === tweetId) {
            updatedTweet = { ...updatedTweet, parentTweet: undefined };
          }

          return updatedTweet;
        })
        .filter((tweet: ITweet) => tweet.tweetId !== tweetId),
    })),
  };
};

/**
 * Update tweets in explore cache
 * Explore data structure: { data: { forYou: [{ category, tweets/posts }] } }
 */
export const updateExploreCache = (
  oldData: IExploreResponse | undefined,
  tweetId: string,
  updater: (tweet: ITweet) => ITweet,
): IExploreResponse | undefined => {
  if (!oldData?.data?.forYou) return oldData;

  return {
    ...oldData,
    data: {
      ...oldData.data,
      forYou: oldData.data.forYou.map((category) => {
        const tweets = category.tweets || category.posts || [];
        const updatedTweets = tweets.map((tweet) => {
          if (tweet.tweetId === tweetId) {
            return updater(tweet);
          }
          return tweet;
        });

        // Return with the same key (tweets or posts) that was used originally
        if (category.tweets) {
          return { ...category, tweets: updatedTweets };
        }
        if (category.posts) {
          return { ...category, posts: updatedTweets };
        }
        return category;
      }),
    },
  };
};

/**
 * Update tweets in category posts infinite cache
 * CategoryPosts data structure: { pages: [{ data: { tweets: [], pagination: {} } }] }
 */
export const updateCategoryPostsCache = (
  oldData: InfiniteData<ICategoryTweetsResponse> | undefined,
  tweetId: string,
  updater: (tweet: ITweet) => ITweet,
): InfiniteData<ICategoryTweetsResponse> | undefined => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      if (!page?.data?.tweets) return page;

      return {
        ...page,
        data: {
          ...page.data,
          tweets: page.data.tweets.map((tweet) => {
            if (tweet.tweetId === tweetId) {
              return updater(tweet);
            }
            return tweet;
          }),
        },
      };
    }),
  };
};

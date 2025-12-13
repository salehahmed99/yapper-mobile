import { ICategoryTweetsResponse, IExploreResponse } from '@/src/modules/explore/types';
import { ISearchPostsResponse } from '@/src/modules/search/types';
import { InfiniteData } from '@tanstack/react-query';
import { ITweet, ITweets } from '../types';

/**
 * Helper to update a single tweet and all its nested tweets (parentTweet, conversationTweet, replies)
 */
const updateTweetDeep = (tweet: ITweet, tweetId: string, updater: (t: ITweet) => ITweet): ITweet => {
  let updatedTweet = tweet;

  // Update main tweet if it matches
  if (tweet.tweetId === tweetId) {
    updatedTweet = updater(tweet);
  }

  // Update nested replies
  if (tweet.replies && Array.isArray(tweet.replies)) {
    const updatedReplies = tweet.replies.map((reply: ITweet) => (reply.tweetId === tweetId ? updater(reply) : reply));
    if (updatedReplies !== tweet.replies) {
      updatedTweet = { ...updatedTweet, replies: updatedReplies };
    }
  }

  // Update nested conversationTweet
  if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
    updatedTweet = { ...updatedTweet, conversationTweet: updater(tweet.conversationTweet) };
  }

  // Update nested parentTweet
  if (tweet.parentTweet && tweet.parentTweet.tweetId === tweetId) {
    updatedTweet = { ...updatedTweet, parentTweet: updater(tweet.parentTweet) };
  }

  return updatedTweet;
};

/**
 * Update tweets in infinite cache (timeline, profile, search results, etc.)
 * Structure: InfiniteData<{ data: ITweet[], pagination: {...} }>
 */
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
      data: page.data.map((tweet: ITweet) => updateTweetDeep(tweet, tweetId, updater)),
    })),
  };
};

/**
 * Remove tweet from infinite cache
 */
export const removeTweetFromInfiniteCache = (oldData: InfiniteData<ITweets> | undefined, tweetId: string) => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page: ITweets) => ({
      ...page,
      data: page.data
        .map((tweet: ITweet) => {
          let updatedTweet = tweet;

          // Filter out matching replies
          if (tweet.replies && Array.isArray(tweet.replies)) {
            const filteredReplies = tweet.replies.filter((reply: ITweet) => reply.tweetId !== tweetId);
            if (filteredReplies.length !== tweet.replies.length) {
              updatedTweet = { ...updatedTweet, replies: filteredReplies };
            }
          }

          // Remove nested conversationTweet if it matches
          if (tweet.conversationTweet && tweet.conversationTweet.tweetId === tweetId) {
            updatedTweet = { ...updatedTweet, conversationTweet: undefined };
          }

          // Remove nested parentTweet if it matches
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
 * Structure: { data: { forYou: [{ category, tweets/posts }] } }
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
        const updatedTweets = tweets.map((tweet) => updateTweetDeep(tweet, tweetId, updater));

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
 * Structure: InfiniteData<{ data: { tweets: [], pagination: {} } }>
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
          tweets: page.data.tweets.map((tweet) => updateTweetDeep(tweet, tweetId, updater)),
        },
      };
    }),
  };
};

export const updateSearchPostsCache = (
  oldData: InfiniteData<ISearchPostsResponse> | undefined,
  tweetId: string,
  updater: (tweet: ITweet) => ITweet,
): InfiniteData<ISearchPostsResponse> | undefined => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      if (!page?.data?.data) return page;

      return {
        ...page,
        data: {
          ...page.data,
          data: page.data.data.map((tweet) => updateTweetDeep(tweet, tweetId, updater)),
        },
      };
    }),
  };
};

/**
 * Update tweets in tweet-quotes infinite cache
 * Structure: InfiniteData<{ data: ITweet[], count, parent?, nextCursor, hasMore }>
 */
export const updateTweetQuotesCache = (
  oldData: InfiniteData<{ data: ITweet[]; count?: number; nextCursor?: string; hasMore: boolean }> | undefined,
  tweetId: string,
  updater: (tweet: ITweet) => ITweet,
): InfiniteData<{ data: ITweet[]; count?: number; nextCursor?: string; hasMore: boolean }> | undefined => {
  if (!oldData?.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      if (!page?.data) return page;

      return {
        ...page,
        data: page.data.map((tweet) => updateTweetDeep(tweet, tweetId, updater)),
      };
    }),
  };
};

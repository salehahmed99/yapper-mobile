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

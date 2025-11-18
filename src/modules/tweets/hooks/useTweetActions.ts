import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { likeTweet, repostTweet, undoRepostTweet, unlikeTweet } from '../services/tweetService';
import { useTweetsFiltersStore } from '../store/useTweetsFiltersStore';
import { ITweet } from '../types';

interface ILikeMutationVariables {
  isLiked: boolean;
}

interface IRepostMutationVariables {
  isReposted: boolean;
}
export const useTweetActions = (tweetId: string) => {
  const queryClient = useQueryClient();
  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);

  // Track pending mutations per tweet
  const pendingLikes = useRef<Set<string>>(new Set());
  const pendingReposts = useRef<Set<string>>(new Set());

  const tweetsQueryKey = ['tweets', tweetsFilters];
  const tweetDetailsQueryKey = ['tweet', { tweetId }];
  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      // Prevent duplicate requests for the same tweet
      if (pendingLikes.current.has(tweetId)) {
        return;
      }

      pendingLikes.current.add(tweetId);
      try {
        if (variables.isLiked) {
          return await unlikeTweet(tweetId);
        }
        return await likeTweet(tweetId);
      } finally {
        pendingLikes.current.delete(tweetId);
      }
    },
    onMutate: async (variables: ILikeMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });
      const previousTweets = queryClient.getQueryData(tweetsQueryKey);
      const previousTweetDetails = queryClient.getQueryData(tweetDetailsQueryKey);

      queryClient.setQueryData(tweetsQueryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweetId === tweetId) {
            return {
              ...tweet,
              isLiked: !variables.isLiked,
              likesCount: variables.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1,
            };
          } else {
            return tweet;
          }
        });
      });

      queryClient.setQueryData(tweetDetailsQueryKey, (oldData: ITweet) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isLiked: !variables.isLiked,
          likesCount: variables.isLiked ? oldData.likesCount - 1 : oldData.likesCount + 1,
        };
      });
      return { previousTweets, previousTweetDetails };
    },
    onError: (error, _, context) => {
      if (context?.previousTweets) queryClient.setQueryData(tweetsQueryKey, context.previousTweets);
      if (context?.previousTweetDetails) queryClient.setQueryData(tweetDetailsQueryKey, context.previousTweetDetails);
      console.log('Error updating like status:', error);
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      // Prevent duplicate requests for the same tweet
      if (pendingReposts.current.has(tweetId)) {
        return;
      }

      pendingReposts.current.add(tweetId);
      try {
        if (variables.isReposted) {
          return await undoRepostTweet(tweetId);
        }
        return await repostTweet(tweetId);
      } finally {
        pendingReposts.current.delete(tweetId);
      }
    },
    onMutate: async (variables: IRepostMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });
      const previousTweets = queryClient.getQueryData(tweetsQueryKey);
      const previousTweetDetails = queryClient.getQueryData(tweetDetailsQueryKey);
      queryClient.setQueryData(tweetsQueryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweetId === tweetId) {
            return {
              ...tweet,
              isReposted: !variables.isReposted,
              repostsCount: variables.isReposted ? tweet.repostsCount - 1 : tweet.repostsCount + 1,
            };
          } else {
            return tweet;
          }
        });
      });

      queryClient.setQueryData(tweetDetailsQueryKey, (oldData: ITweet) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isReposted: !variables.isReposted,
          repostsCount: variables.isReposted ? oldData.repostsCount - 1 : oldData.repostsCount + 1,
        };
      });
      return { previousTweets, previousTweetDetails };
    },

    onError: (error, _, context) => {
      if (context?.previousTweets) queryClient.setQueryData(tweetsQueryKey, context.previousTweets);
      if (context?.previousTweetDetails) queryClient.setQueryData(tweetDetailsQueryKey, context.previousTweetDetails);
      console.log('Error updating repost status:', error);
    },
  });

  return { likeMutation, repostMutation };
};

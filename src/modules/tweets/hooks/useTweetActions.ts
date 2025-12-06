import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, usePathname } from 'expo-router';
import {
  bookmarkTweet,
  createTweet,
  deleteTweet,
  likeTweet,
  quoteTweet,
  replyToTweet,
  repostTweet,
  unbookmarkTweet,
  undoRepostTweet,
  unlikeTweet,
} from '../services/tweetService';
import { ITweet, ITweets } from '../types';
import { removeTweetFromInfiniteCache, updateTweetsInInfiniteCache } from '../utils/cacheUtils';

interface ILikeMutationVariables {
  tweetId: string;
  isLiked: boolean;
}

interface IRepostMutationVariables {
  tweetId: string;
  isReposted: boolean;
}
interface IBookmarkMutationVariables {
  tweetId: string;
  isBookmarked: boolean;
}
export const useTweetActions = (tweetId: string) => {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const tweetsQueryKey = ['tweets'];
  const tweetDetailsQueryKey = ['tweet', { tweetId }];
  const profileTweetsQueryKey = ['profile'];

  const toggleLike = (tweet: ITweet) => {
    return {
      ...tweet,
      isLiked: !tweet.isLiked,
      likesCount: tweet.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1,
    };
  };

  const toggleRepost = (tweet: ITweet) => {
    return {
      ...tweet,
      isReposted: !tweet.isReposted,
      repostsCount: tweet.isReposted ? tweet.repostsCount - 1 : tweet.repostsCount + 1,
    };
  };

  const toggleBookmark = (tweet: ITweet) => {
    return {
      ...tweet,
      isBookmarked: !tweet.isBookmarked,
    };
  };

  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      return variables.isLiked ? unlikeTweet(tweetId) : likeTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleLike),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleLike),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleLike(oldData) : oldData));
    },

    onError: (error) => {
      console.log('Error updating like status:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      return variables.isReposted ? undoRepostTweet(tweetId) : repostTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleRepost),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleRepost(oldData) : oldData));
    },

    onError: (error) => {
      console.log('Error updating repost status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (variables: IBookmarkMutationVariables) => {
      return variables.isBookmarked ? unbookmarkTweet(tweetId) : bookmarkTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleBookmark),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) =>
        oldData ? toggleBookmark(oldData) : oldData,
      );
    },

    onError: (error) => {
      console.log('Error updating bookmark status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return createTweet(content, mediaUris);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
    },
  });

  const replyToPostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return replyToTweet(tweetId, content, mediaUris);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
    },
  });

  const quotePostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return quoteTweet(tweetId, content, mediaUris);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      // Implement delete tweet functionality here
      return deleteTweet(tweetId);
    },
    onMutate: async () => {
      // Cancel any pending queries
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      // Optimistically update the cache
      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        removeTweetFromInfiniteCache(oldData, tweetId),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        removeTweetFromInfiniteCache(oldData, tweetId),
      );

      // Navigate back if the current screen is the tweet details screen
      if (pathname.includes(tweetId)) {
        if (router.canGoBack()) router.back();
      }
    },
    onError: (error) => {
      // Error deleting tweet
      console.log('Error deleting tweet:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  return {
    likeMutation,
    repostMutation,
    bookmarkMutation,
    addPostMutation,
    replyToPostMutation,
    quotePostMutation,
    deletePostMutation,
  };
};

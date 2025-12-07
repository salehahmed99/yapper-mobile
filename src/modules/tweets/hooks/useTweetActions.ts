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

interface IReplyMutationVariables {
  tweetId: string;
  content: string;
  mediaUris?: string[];
}

interface IQuoteMutationVariables {
  tweetId: string;
  content: string;
  mediaUris?: string[];
}

interface ICreatePostMutationVariables {
  content: string;
  mediaUris?: string[];
}

interface IDeleteMutationVariables {
  tweetId: string;
}

export const useTweetActions = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const tweetsQueryKey = ['tweets'];
  const profileTweetsQueryKey = ['profile'];
  const repliesQueryKey = ['replies'];

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
    let newBookmarksCount = undefined;
    if (tweet.bookmarksCount !== undefined) {
      newBookmarksCount = tweet.isBookmarked ? tweet.bookmarksCount - 1 : tweet.bookmarksCount + 1;
    }
    return {
      ...tweet,
      isBookmarked: !tweet.isBookmarked,
      bookmarksCount: newBookmarksCount,
    };
  };

  const incrementRepliesCount = (tweet: ITweet) => {
    return {
      ...tweet,
      repliesCount: tweet.repliesCount + 1,
    };
  };

  const incrementQuotesCount = (tweet: ITweet) => {
    return {
      ...tweet,
      quotesCount: tweet.quotesCount + 1,
    };
  };

  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      return variables.isLiked ? unlikeTweet(variables.tweetId) : likeTweet(variables.tweetId);
    },
    onMutate: async (variables: ILikeMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleLike),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>(
        {
          queryKey: profileTweetsQueryKey,
          predicate: (query) => !query.queryKey.includes('likes'),
        },
        (oldData) => updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleLike),
      );
      if (variables.isLiked) {
        queryClient.setQueriesData<InfiniteData<ITweets>>(
          {
            queryKey: profileTweetsQueryKey,
            predicate: (query) => query.queryKey.includes('likes'),
          },
          (oldData) => removeTweetFromInfiniteCache(oldData, variables.tweetId),
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: profileTweetsQueryKey,
          predicate: (query) => query.queryKey.includes('likes'),
        });
      }

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleLike),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleLike(oldData) : oldData,
      );
    },

    onError: (error, variables) => {
      console.log('Error updating like status:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      return variables.isReposted ? undoRepostTweet(variables.tweetId) : repostTweet(variables.tweetId);
    },
    onMutate: async (variables: IRepostMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleRepost(oldData) : oldData,
      );
    },

    onError: (error, variables) => {
      console.log('Error updating repost status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (variables: IBookmarkMutationVariables) => {
      return variables.isBookmarked ? unbookmarkTweet(variables.tweetId) : bookmarkTweet(variables.tweetId);
    },
    onMutate: async (variables: IBookmarkMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleBookmark(oldData) : oldData,
      );
    },

    onError: (error, variables) => {
      console.log('Error updating bookmark status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: ICreatePostMutationVariables) => {
      return createTweet(content, mediaUris);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
    },
  });

  const replyToPostMutation = useMutation({
    mutationFn: async (variables: IReplyMutationVariables) => {
      return replyToTweet(variables.tweetId, variables.content, variables.mediaUris);
    },
    onMutate: async (variables: IReplyMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      // update tweet details query replies count
      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? incrementRepliesCount(oldData) : oldData,
      );

      // go through all replies queries and update replies count of the reply i replied to
      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, incrementRepliesCount),
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });

      // only invalidate queries for the replies of the tweet i replied to (not all replies)
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
    onError: (error, variables) => {
      console.log('Error replying to tweet:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });

      // if error, invalidate all replies queries since i don't have access to the tweet id of the reply that failed
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
  });

  const quotePostMutation = useMutation({
    mutationFn: async (variables: IQuoteMutationVariables) => {
      return quoteTweet(variables.tweetId, variables.content, variables.mediaUris);
    },
    onMutate: async (variables: IQuoteMutationVariables) => {
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? incrementQuotesCount(oldData) : oldData,
      );
      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, incrementQuotesCount),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
    },
    onError: (error, variables) => {
      console.log('Error quoting tweet:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });

      // if error, invalidate all replies queries since i don't have access to the tweet id of the reply that failed
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (variables: IDeleteMutationVariables) => {
      // Implement delete tweet functionality here
      return deleteTweet(variables.tweetId);
    },
    onMutate: async (variables: IDeleteMutationVariables) => {
      // Cancel any pending queries
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: profileTweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      // Optimistically update the cache
      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        removeTweetFromInfiniteCache(oldData, variables.tweetId),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        removeTweetFromInfiniteCache(oldData, variables.tweetId),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        removeTweetFromInfiniteCache(oldData, variables.tweetId),
      );

      // Navigate back if the current screen is the tweet details screen
      if (pathname.includes(variables.tweetId)) {
        if (router.canGoBack()) router.back();
      }
    },
    onError: (error, variables) => {
      // Error deleting tweet
      console.log('Error deleting tweet:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
    },

    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
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

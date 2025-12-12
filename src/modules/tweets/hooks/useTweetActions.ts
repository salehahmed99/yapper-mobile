import { ICategoryTweetsResponse, IExploreResponse } from '@/src/modules/explore/types';
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
import { IBookmarks, ITweet, ITweets } from '../types';
import {
  removeTweetFromInfiniteCache,
  updateCategoryPostsCache,
  updateExploreCache,
  updateTweetsInInfiniteCache,
} from '../utils/cacheUtils';

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
  const bookmarksQueryKey = ['bookmarks'];
  const notificationsQueryKey = ['notifications'];
  const mentionsQueryKey = ['mentions'];

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
      await queryClient.cancelQueries({ queryKey: ['searchPosts'] });
      await queryClient.cancelQueries({ queryKey: ['explore', 'forYou'] });
      await queryClient.cancelQueries({ queryKey: ['categoryPosts'] });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      await queryClient.cancelQueries({ queryKey: mentionsQueryKey });

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

      queryClient.setQueriesData<InfiniteData<any>>({ queryKey: ['searchPosts'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleLike),
      );

      queryClient.setQueriesData<IExploreResponse>({ queryKey: ['explore', 'forYou'] }, (oldData) =>
        updateExploreCache(oldData, variables.tweetId, toggleLike),
      );

      queryClient.setQueriesData<InfiniteData<ICategoryTweetsResponse>>({ queryKey: ['categoryPosts'] }, (oldData) =>
        updateCategoryPostsCache(oldData, variables.tweetId, toggleLike),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleLike(oldData) : oldData,
      );
    },

    onSuccess: (_, variables) => {
      // Invalidate likers list for this tweet so activity screen shows updated data
      queryClient.invalidateQueries({
        queryKey: ['userList', 'tweet', variables.tweetId, 'likes'],
      });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
    },

    onError: (error: any, variables) => {
      console.log('Error updating like status:', error);
      console.log('Like error response:', error?.response?.data);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
      queryClient.invalidateQueries({ queryKey: ['searchPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explore', 'forYou'] });
      queryClient.invalidateQueries({ queryKey: ['categoryPosts'] });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
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
      await queryClient.cancelQueries({ queryKey: ['searchPosts'] });
      await queryClient.cancelQueries({ queryKey: ['explore', 'forYou'] });
      await queryClient.cancelQueries({ queryKey: ['categoryPosts'] });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      await queryClient.cancelQueries({ queryKey: mentionsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<any>>({ queryKey: ['searchPosts'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<IExploreResponse>({ queryKey: ['explore', 'forYou'] }, (oldData) =>
        updateExploreCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ICategoryTweetsResponse>>({ queryKey: ['categoryPosts'] }, (oldData) =>
        updateCategoryPostsCache(oldData, variables.tweetId, toggleRepost),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleRepost(oldData) : oldData,
      );
    },

    onSuccess: (_, variables) => {
      // Invalidate profile posts to refetch and show the new repost entry
      queryClient.invalidateQueries({
        queryKey: profileTweetsQueryKey,
        predicate: (query) => query.queryKey.includes('posts'),
      });
      // Invalidate reposters list for this tweet so activity screen shows updated data
      queryClient.invalidateQueries({
        queryKey: ['userList', 'tweet', variables.tweetId, 'reposts'],
      });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
    },

    onError: (error, variables) => {
      console.log('Error updating repost status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
      queryClient.invalidateQueries({ queryKey: ['searchPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explore', 'forYou'] });
      queryClient.invalidateQueries({ queryKey: ['categoryPosts'] });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
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
      await queryClient.cancelQueries({ queryKey: ['searchPosts'] });
      await queryClient.cancelQueries({ queryKey: ['explore', 'forYou'] });
      await queryClient.cancelQueries({ queryKey: ['categoryPosts'] });
      await queryClient.cancelQueries({ queryKey: bookmarksQueryKey });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      await queryClient.cancelQueries({ queryKey: mentionsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: profileTweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: repliesQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<any>>({ queryKey: ['searchPosts'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<IExploreResponse>({ queryKey: ['explore', 'forYou'] }, (oldData) =>
        updateExploreCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueriesData<InfiniteData<ICategoryTweetsResponse>>({ queryKey: ['categoryPosts'] }, (oldData) =>
        updateCategoryPostsCache(oldData, variables.tweetId, toggleBookmark),
      );

      queryClient.setQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }], (oldData) =>
        oldData ? toggleBookmark(oldData) : oldData,
      );

      // Handle Bookmarks Optimistic Update
      if (variables.isBookmarked) {
        // Removing bookmark
        queryClient.setQueriesData<InfiniteData<IBookmarks>>(
          { queryKey: bookmarksQueryKey },
          (oldData) =>
            removeTweetFromInfiniteCache(
              oldData as unknown as InfiniteData<ITweets>,
              variables.tweetId,
            ) as unknown as InfiniteData<IBookmarks>,
        );
      } else {
        // Adding bookmark
        const tweet =
          queryClient.getQueryData<ITweet>(['tweet', { tweetId: variables.tweetId }]) ||
          queryClient
            .getQueryData<InfiniteData<ITweets>>(tweetsQueryKey)
            ?.pages.flatMap((p) => p.data)
            .find((t) => t.tweetId === variables.tweetId) ||
          queryClient
            .getQueryData<InfiniteData<ITweets>>(profileTweetsQueryKey)
            ?.pages.flatMap((p) => {
              const page = p as any;
              return Array.isArray(page.data?.data) ? page.data.data : page.data;
            })
            .find((t: ITweet) => t.tweetId === variables.tweetId);

        if (tweet) {
          const bookmarkedTweet = { ...tweet, isBookmarked: true, bookmarksCount: (tweet.bookmarksCount || 0) + 1 };
          queryClient.setQueriesData<InfiniteData<IBookmarks>>({ queryKey: bookmarksQueryKey }, (oldData) => {
            if (!oldData?.pages) return oldData;

            const newPages = [...oldData.pages];
            if (newPages.length > 0) {
              // Add to the beginning of the first page
              newPages[0] = {
                ...newPages[0],
                data: [bookmarkedTweet, ...newPages[0].data],
              };
            }

            return {
              ...oldData,
              pages: newPages,
            };
          });
        }
      }
    },

    onError: (error, variables) => {
      console.log('Error updating bookmark status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['tweet', { tweetId: variables.tweetId }] });
      queryClient.invalidateQueries({ queryKey: repliesQueryKey });
      queryClient.invalidateQueries({ queryKey: ['searchPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explore', 'forYou'] });
      queryClient.invalidateQueries({ queryKey: ['categoryPosts'] });
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: profileTweetsQueryKey });
      // Invalidate quotes list for this tweet so activity screen shows updated data
      queryClient.invalidateQueries({
        queryKey: ['tweet-quotes', variables.tweetId],
      });
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

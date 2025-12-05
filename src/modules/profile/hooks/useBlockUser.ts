import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { ITweet, ITweets } from '../../tweets/types';
import { blockUser, unblockUser } from '../services/profileService';
import { updateUserStateInTweetsCache } from '../utils/profileCacheUtils';

interface BlockMutationVariables {
  userId: string;
  isBlocked: boolean;
}

export const useBlockUser = (initialBlockState: boolean = false) => {
  const [isBlocked, setIsBlocked] = useState(initialBlockState);
  const queryClient = useQueryClient();

  const toggleBlockState = (tweet: ITweet) => {
    return {
      ...tweet,
      user: {
        ...tweet.user,
        isBlocked: !tweet.user.isBlocked,
      },
    };
  };

  const blockMutation = useMutation({
    mutationFn: async (variables: BlockMutationVariables) => {
      return variables.isBlocked ? unblockUser(variables.userId) : blockUser(variables.userId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: ['user', variables.userId] });
      await queryClient.cancelQueries({ queryKey: ['tweets'] });

      setIsBlocked(!variables.isBlocked);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleBlockState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleBlockState),
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });

      Toast.show({
        type: 'success',
        text1: variables.isBlocked ? 'Unblocked' : 'Blocked',
        text2: variables.isBlocked ? 'You have unblocked this user' : 'You have blocked this user',
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    onError: (error, variables) => {
      setIsBlocked(variables.isBlocked);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'An error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });

  const toggleBlock = async (userId: string) => {
    if (blockMutation.isPending || !userId) return;
    await blockMutation.mutateAsync({ userId, isBlocked });
  };

  return {
    isBlocked,
    isLoading: blockMutation.isPending,
    toggleBlock,
    setIsBlocked,
  };
};

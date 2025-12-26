import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ITweet, ITweets } from '../../tweets/types';
import { muteUser, unmuteUser } from '../services/profileService';
import { updateUserStateInTweetsCache } from '../utils/profileCacheUtils';

interface MuteMutationVariables {
  userId: string;
  isMuted: boolean;
}

export const useMuteUser = (initialMuteState: boolean = false) => {
  const [isMuted, setIsMuted] = useState(initialMuteState);
  const queryClient = useQueryClient();

  const toggleMuteState = (tweet: ITweet) => {
    return {
      ...tweet,
      user: {
        ...tweet.user,
        isMuted: !tweet.user.isMuted,
      },
    };
  };

  const muteMutation = useMutation({
    mutationFn: async (variables: MuteMutationVariables) => {
      return variables.isMuted ? unmuteUser(variables.userId) : muteUser(variables.userId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: ['user', variables.userId] });
      await queryClient.cancelQueries({ queryKey: ['tweets'] });

      setIsMuted(!variables.isMuted);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleMuteState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleMuteState),
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
    onError: (error, variables) => {
      setIsMuted(variables.isMuted);

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
  });

  const toggleMute = async (userId: string) => {
    if (muteMutation.isPending || !userId) return;
    await muteMutation.mutateAsync({ userId, isMuted });
  };

  return {
    isMuted,
    isLoading: muteMutation.isPending,
    toggleMute,
    setIsMuted,
  };
};

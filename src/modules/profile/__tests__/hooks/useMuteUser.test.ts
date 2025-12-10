/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useMuteUser } from '../../hooks/useMuteUser';
import * as profileService from '../../services/profileService';

jest.mock('../../services/profileService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ children }: any) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMuteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default mute state', () => {
    const { result } = renderHook(() => useMuteUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with custom mute state', () => {
    const { result } = renderHook(() => useMuteUser(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isMuted).toBe(true);
  });

  it('should mute a user successfully', async () => {
    (profileService.muteUser as jest.Mock).mockResolvedValue({
      count: 1,
      message: 'Muted successfully',
    });

    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleMute('user-123');
    });

    await waitFor(() => {
      expect(result.current.isMuted).toBe(true);
      expect(profileService.muteUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('should unmute a user successfully', async () => {
    (profileService.unmuteUser as jest.Mock).mockResolvedValue({
      count: 0,
      message: 'Unmuted successfully',
    });

    const { result } = renderHook(() => useMuteUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleMute('user-456');
    });

    await waitFor(() => {
      expect(result.current.isMuted).toBe(false);
      expect(profileService.unmuteUser).toHaveBeenCalledWith('user-456');
    });
  });

  it('should not toggle when mutation is pending', async () => {
    (profileService.muteUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleMute('user-123');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => {
      await result.current.toggleMute('user-123');
    });

    expect(profileService.muteUser).toHaveBeenCalledTimes(1);
  });

  it('should not toggle when userId is empty', async () => {
    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleMute('');
    });

    expect(profileService.muteUser).not.toHaveBeenCalled();
  });

  it('should handle mute error and revert state', async () => {
    const error = new Error('Mute failed');
    (profileService.muteUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleMute('user-789');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isMuted).toBe(false);
    });
  });

  it('should handle unmute error and revert state', async () => {
    const error = new Error('Unmute failed');
    (profileService.unmuteUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useMuteUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleMute('user-321');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isMuted).toBe(true);
    });
  });

  it('should allow manual state setting', () => {
    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setIsMuted(true);
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.setIsMuted(false);
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should update loading state during mutation', async () => {
    (profileService.muteUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ count: 1, message: 'Success' }), 100)),
    );

    const { result } = renderHook(() => useMuteUser(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.toggleMute('user-999');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

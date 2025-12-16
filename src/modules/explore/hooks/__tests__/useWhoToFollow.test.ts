import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import * as exploreService from '../../services/exploreService';
import { useWhoToFollow, whoToFollowKeys } from '../useWhoToFollow';

jest.mock('@tanstack/react-query');
jest.mock('../../services/exploreService');

describe('useWhoToFollow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    }));
  });

  describe('whoToFollowKeys', () => {
    it('should export correct query keys', () => {
      expect(whoToFollowKeys.all).toEqual(['whoToFollow']);
      expect(whoToFollowKeys.list()).toEqual(['whoToFollow', 'list']);
    });
  });

  describe('useWhoToFollow', () => {
    it('should call useQuery with correct queryKey', () => {
      renderHook(() => useWhoToFollow());

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['whoToFollow', 'list'],
        }),
      );
    });

    it('should use getWhoToFollow as queryFn', () => {
      renderHook(() => useWhoToFollow());

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryFn: exploreService.getWhoToFollow,
        }),
      );
    });

    it('should set stale time to 30 seconds', () => {
      renderHook(() => useWhoToFollow());

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 30 * 1000,
        }),
      );
    });

    it('should set gc time to 5 minutes', () => {
      renderHook(() => useWhoToFollow());

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          gcTime: 5 * 60 * 1000,
        }),
      );
    });

    it('should return query result', () => {
      const mockData = {
        users: [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ],
      };

      const mockResult = {
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
      };

      (useQuery as jest.Mock).mockReturnValue(mockResult);

      const { result } = renderHook(() => useWhoToFollow());

      expect(result.current).toBe(mockResult);
    });

    it('should handle loading state', () => {
      const mockResult = {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      };

      (useQuery as jest.Mock).mockReturnValue(mockResult);

      const { result } = renderHook(() => useWhoToFollow());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error state', () => {
      const mockError = new Error('Failed to fetch');
      const mockResult = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
      };

      (useQuery as jest.Mock).mockReturnValue(mockResult);

      const { result } = renderHook(() => useWhoToFollow());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });
});

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useCategoryPosts } from '../../hooks/useCategoryPosts';
import { useExploreData } from '../../hooks/useExploreData';
import { useTrends } from '../../hooks/useTrends';
import * as exploreService from '../../services/exploreService';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/exploreService');

describe('Explore Hooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useExploreData', () => {
    it('should call useQuery with correct params when enabled', () => {
      renderHook(() => useExploreData(true));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['explore', 'forYou'],
          enabled: true,
        }),
      );
    });

    it('should call useQuery with enabled=false when disabled', () => {
      renderHook(() => useExploreData(false));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['explore', 'forYou'],
          enabled: false,
        }),
      );
    });

    it('should call getExploreData in queryFn', async () => {
      (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn();
        return {};
      });

      renderHook(() => useExploreData());
      expect(exploreService.getExploreData).toHaveBeenCalled();
    });
  });

  describe('useTrends', () => {
    it('should call useQuery with correct queryKey for trending tab', () => {
      renderHook(() => useTrends('trending', true));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['trends', 'trending'],
          enabled: true,
        }),
      );
    });

    it('should call useQuery with correct queryKey for news tab', () => {
      renderHook(() => useTrends('news', true));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['trends', 'news'],
        }),
      );
    });

    it('should call getTrends with undefined for trending tab', async () => {
      (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn();
        return {};
      });

      renderHook(() => useTrends('trending'));
      expect(exploreService.getTrends).toHaveBeenCalledWith(undefined);
    });

    it('should call getTrends with category for specific tabs', async () => {
      (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn();
        return {};
      });

      renderHook(() => useTrends('sports'));
      expect(exploreService.getTrends).toHaveBeenCalledWith('sports');
    });
  });

  describe('useCategoryPosts', () => {
    it('should call useInfiniteQuery with correct params', () => {
      renderHook(() => useCategoryPosts('123', true));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['categoryPosts', '123'],
          enabled: true,
        }),
      );
    });

    it('should be disabled when categoryId is empty', () => {
      renderHook(() => useCategoryPosts('', true));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call getCategoryTweets with correct params in queryFn', async () => {
      (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn({ pageParam: 2 });
        return {};
      });

      renderHook(() => useCategoryPosts('123'));
      expect(exploreService.getCategoryTweets).toHaveBeenCalledWith('123', 2);
    });
  });
});

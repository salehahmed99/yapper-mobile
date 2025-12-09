import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useSearchPosts } from '../../hooks/useSearchPosts';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import * as searchService from '../../services/searchService';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/searchService');

describe('Search Hooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useSearchSuggestions', () => {
    it('should call useQuery with correct params', () => {
      renderHook(() => useSearchSuggestions({ query: 'test', enabled: true }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchSuggestions', 'test', undefined],
          enabled: true,
        }),
      );
    });

    it('should include username in queryKey', () => {
      renderHook(() => useSearchSuggestions({ query: 'test', username: 'user', enabled: true }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchSuggestions', 'test', 'user'],
        }),
      );
    });

    it('should be disabled when query is empty', () => {
      renderHook(() => useSearchSuggestions({ query: '', enabled: true }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call getSearchSuggestions in queryFn', async () => {
      (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn();
        return {};
      });

      renderHook(() => useSearchSuggestions({ query: 'test' }));
      expect(searchService.getSearchSuggestions).toHaveBeenCalledWith({ query: 'test', username: undefined });
    });
  });

  describe('useSearchPosts', () => {
    it('should call useInfiniteQuery with correct queryKey for posts', () => {
      renderHook(() => useSearchPosts({ query: 'test', type: 'posts', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchPosts', 'posts', 'test', undefined, 20],
          enabled: true,
        }),
      );
    });

    it('should call useInfiniteQuery with correct queryKey for media', () => {
      renderHook(() => useSearchPosts({ query: 'photos', type: 'media', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchPosts', 'media', 'photos', undefined, 20],
        }),
      );
    });

    it('should call useInfiniteQuery with correct queryKey for latest', () => {
      renderHook(() => useSearchPosts({ query: 'news', type: 'latest', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchPosts', 'latest', 'news', undefined, 20],
        }),
      );
    });

    it('should be disabled when query is empty', () => {
      renderHook(() => useSearchPosts({ query: '', type: 'posts', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call searchPosts for posts type in queryFn', async () => {
      (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn({ pageParam: 'cursor' });
        return {};
      });

      renderHook(() => useSearchPosts({ query: 'test', type: 'posts' }));
      expect(searchService.searchPosts).toHaveBeenCalledWith({
        query: 'test',
        username: undefined,
        cursor: 'cursor',
        limit: 20,
        hasMedia: undefined,
      });
    });

    it('should call searchPosts with hasMedia for media type', async () => {
      (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn({ pageParam: undefined });
        return {};
      });

      renderHook(() => useSearchPosts({ query: 'test', type: 'media' }));
      expect(searchService.searchPosts).toHaveBeenCalledWith({
        query: 'test',
        username: undefined,
        cursor: undefined,
        limit: 20,
        hasMedia: true,
      });
    });

    it('should call searchLatestPosts for latest type', async () => {
      (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn({ pageParam: 'cursor' });
        return {};
      });

      renderHook(() => useSearchPosts({ query: 'test', type: 'latest' }));
      expect(searchService.searchLatestPosts).toHaveBeenCalledWith({
        query: 'test',
        username: undefined,
        cursor: 'cursor',
        limit: 20,
      });
    });
  });

  describe('useSearchUsers', () => {
    beforeEach(() => {
      // Default mock that doesn't call queryFn
      (useInfiniteQuery as jest.Mock).mockReturnValue({});
    });

    it('should call useInfiniteQuery with correct queryKey', () => {
      renderHook(() => useSearchUsers({ query: 'john', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchUsers', 'john', undefined, 20],
          enabled: true,
        }),
      );
    });

    it('should include username in queryKey', () => {
      renderHook(() => useSearchUsers({ query: 'john', username: 'from', limit: 10, enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['searchUsers', 'john', 'from', 10],
        }),
      );
    });

    it('should be disabled when query is empty', () => {
      renderHook(() => useSearchUsers({ query: '', enabled: true }));

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call searchUsers in queryFn', async () => {
      (searchService.searchUsers as jest.Mock).mockResolvedValue({
        data: { data: [], pagination: { nextCursor: null, hasMore: false } },
      });

      (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
        queryFn({ pageParam: 'cursor' });
        return {};
      });

      renderHook(() => useSearchUsers({ query: 'john' }));
      expect(searchService.searchUsers).toHaveBeenCalledWith({
        query: 'john',
        username: undefined,
        cursor: 'cursor',
        limit: 20,
      });
    });
  });
});

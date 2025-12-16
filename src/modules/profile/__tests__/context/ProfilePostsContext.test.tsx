import { act, render, renderHook } from '@testing-library/react-native';
import React from 'react';
import { ProfilePostsProvider, useProfilePosts } from '../../context/ProfilePostsContext';

describe('ProfilePostsContext', () => {
  describe('ProfilePostsProvider', () => {
    it('should render children correctly', () => {
      const { UNSAFE_root } = render(
        <ProfilePostsProvider>
          <></>
        </ProfilePostsProvider>,
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('useProfilePosts', () => {
    it('should throw error when used outside of provider', () => {
      // Suppress console.log for this test
      const originalError = console.log;
      console.log = jest.fn();

      expect(() => {
        renderHook(() => useProfilePosts());
      }).toThrow('useProfilePosts must be used within ProfilePostsProvider');

      console.log = originalError;
    });

    it('should provide context value when used within provider', () => {
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      expect(result.current).toHaveProperty('registerFetchNextPage');
      expect(result.current).toHaveProperty('triggerFetchNextPage');
      expect(result.current).toHaveProperty('registerRefresh');
      expect(result.current).toHaveProperty('triggerRefresh');
    });

    it('should register and trigger fetch next page', () => {
      const mockFetchNextPage = jest.fn();
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      act(() => {
        result.current.registerFetchNextPage(mockFetchNextPage, true, false);
      });

      act(() => {
        result.current.triggerFetchNextPage();
      });

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should not trigger fetch when already fetching', () => {
      const mockFetchNextPage = jest.fn();
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      act(() => {
        result.current.registerFetchNextPage(mockFetchNextPage, true, true);
      });

      act(() => {
        result.current.triggerFetchNextPage();
      });

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should not trigger fetch when no more pages', () => {
      const mockFetchNextPage = jest.fn();
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      act(() => {
        result.current.registerFetchNextPage(mockFetchNextPage, false, false);
      });

      act(() => {
        result.current.triggerFetchNextPage();
      });

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should register and trigger refresh', () => {
      const mockRefresh = jest.fn();
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      act(() => {
        result.current.registerRefresh(mockRefresh);
      });

      act(() => {
        result.current.triggerRefresh();
      });

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should handle rapid trigger calls with debounce', () => {
      jest.useFakeTimers();
      const mockFetchNextPage = jest.fn();
      const { result } = renderHook(() => useProfilePosts(), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper: ({ children }: any) => <ProfilePostsProvider>{children}</ProfilePostsProvider>,
      });

      act(() => {
        result.current.registerFetchNextPage(mockFetchNextPage, true, false);
      });

      act(() => {
        result.current.triggerFetchNextPage();
        result.current.triggerFetchNextPage();
        result.current.triggerFetchNextPage();
      });

      expect(mockFetchNextPage).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});

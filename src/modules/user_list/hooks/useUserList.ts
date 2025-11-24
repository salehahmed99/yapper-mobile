import { IUser } from '@/src/types/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserList } from '../services/userListService';
import { UserListQuery } from '../types';

type UseUserListOptions = UserListQuery & {
  autoLoad?: boolean;
};

interface IUseUserListResult {
  users: IUser[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasNextPage: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export const useUserList = (options: UseUserListOptions): IUseUserListResult => {
  const { autoLoad = true } = options;

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadingRef = useRef(false);
  const currentPageRef = useRef(0);
  const currentCursorRef = useRef<string | null>(null);

  const fetchPage = useCallback(
    async (isRefresh = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setError(null);
      setLoading(!isRefresh);
      setRefreshing(isRefresh);

      try {
        const cursor = isRefresh ? '' : currentCursorRef.current || '';
        const data = await getUserList({ ...options, cursor });

        setUsers((prev) => {
          if (isRefresh) {
            return data.users;
          }

          const existingIds = new Set(prev.map((u) => u.id));
          const newUsers = data.users.filter((u) => !existingIds.has(u.id));

          return [...prev, ...newUsers];
        });
        currentCursorRef.current = data.nextCursor || null;
        setHasNextPage(data.hasMore ?? false);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const message = error?.response?.data?.message || error?.message || 'Failed to load users';
        setError(message);
        setHasNextPage(false);
        if (isRefresh) {
          setUsers([]);
          currentPageRef.current = 1;
          currentCursorRef.current = null;
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [options],
  );

  const refresh = useCallback(() => fetchPage(true), [fetchPage]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingRef.current) {
      fetchPage(false);
    }
  }, [hasNextPage, fetchPage]);

  useEffect(() => {
    if (autoLoad) fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  return {
    users,
    loading,
    refreshing,
    error,
    hasNextPage,
    refresh,
    loadMore,
  };
};

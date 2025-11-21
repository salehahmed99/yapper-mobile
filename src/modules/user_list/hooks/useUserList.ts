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
  const currentCursorRef = useRef<string | undefined>(undefined);

  const fetchPage = useCallback(
    async (cursor: string | undefined, isRefresh = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setError(null);
      setLoading(!isRefresh);
      setRefreshing(isRefresh);

      try {
        const data = await getUserList({ ...options, cursor });

        setUsers((prev) => {
          if (isRefresh) {
            return data.users;
          }

          // Deduplicate: only add users that don't already exist
          const existingIds = new Set(prev.map((u) => u.id));
          const newUsers = data.users.filter((u) => !existingIds.has(u.id));

          return [...prev, ...newUsers];
        });
        currentCursorRef.current = data.nextCursor || undefined;
        setHasNextPage(data.hasMore);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const message = error?.response?.data?.message || error?.message || 'Failed to load users';
        setError(message);
        setHasNextPage(false);
        if (isRefresh) {
          setUsers([]);
          currentCursorRef.current = undefined;
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [options],
  );

  const refresh = useCallback(() => fetchPage(undefined, true), [fetchPage]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingRef.current) {
      fetchPage(currentCursorRef.current, false);
    }
  }, [hasNextPage, fetchPage]);

  useEffect(() => {
    if (autoLoad) fetchPage(undefined, false);
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

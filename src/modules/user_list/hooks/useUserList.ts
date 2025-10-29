import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserList } from '../services/userListService';
import { FetchUserListParams, IUserListUser, UserListType } from '../types';

interface UseUserListOptions {
  tweetId: string;
  type: UserListType;
  autoLoad?: boolean;
}

interface UseUserListResult {
  users: IUserListUser[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasNextPage: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useUserList = ({ tweetId, type, autoLoad = true }: UseUserListOptions): UseUserListResult => {
  const [users, setUsers] = useState<IUserListUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const loadingRef = useRef(false);

  const fetchPage = useCallback(
    async (params: FetchUserListParams, opts?: { reset?: boolean; isRefresh?: boolean }) => {
      if (loadingRef.current) {
        return;
      }

      const isReset = opts?.reset ?? false;
      const isRefresh = opts?.isRefresh ?? false;

      loadingRef.current = true;
      setError(null);
      setLoading(!isRefresh);
      setRefreshing(isRefresh);

      try {
        const data = await getUserList(params);
        setUsers((prev) => (isReset ? data.users : [...prev, ...data.users]));
        setCursor(data.nextCursor ?? null);
        setHasNextPage(Boolean(data.nextCursor));
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load users';
        setError(message);
        if (isReset) {
          setUsers([]);
          setCursor(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    await fetchPage({ tweetId, type, cursor: null }, { reset: true, isRefresh: true });
  }, [fetchPage, tweetId, type]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingRef.current) {
      return;
    }
    await fetchPage({ tweetId, type, cursor }, { reset: false, isRefresh: false });
  }, [cursor, fetchPage, hasNextPage, tweetId, type]);

  useEffect(() => {
    setUsers([]);
    setCursor(null);
    setHasNextPage(true);
    if (autoLoad) {
      fetchPage({ tweetId, type, cursor: null }, { reset: true, isRefresh: false });
    }
  }, [autoLoad, fetchPage, tweetId, type]);

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

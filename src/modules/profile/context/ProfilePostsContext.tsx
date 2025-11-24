import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

interface ProfilePostsContextType {
  registerFetchNextPage: (fetchNextPage: () => void, hasNextPage: boolean, isFetchingNextPage: boolean) => void;
  triggerFetchNextPage: () => void;
  registerRefresh: (refresh: () => void) => void;
  triggerRefresh: () => void;
}

const ProfilePostsContext = createContext<ProfilePostsContextType | undefined>(undefined);

export const ProfilePostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fetchNextPageRef = useRef<(() => void) | null>(null);
  const hasNextPageRef = useRef<boolean>(false);
  const isFetchingNextPageRef = useRef<boolean>(false);
  const refreshRef = useRef<(() => void) | null>(null);
  const lastTriggerTime = useRef<number>(0);

  const registerFetchNextPage = useCallback(
    (fetchNextPage: () => void, hasNextPage: boolean, isFetchingNextPage: boolean) => {
      fetchNextPageRef.current = fetchNextPage;
      hasNextPageRef.current = hasNextPage;
      isFetchingNextPageRef.current = isFetchingNextPage;
    },
    [],
  );

  const triggerFetchNextPage = useCallback(() => {
    if (isFetchingNextPageRef.current || !hasNextPageRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastTriggerTime.current < 500) {
      return;
    }

    if (fetchNextPageRef.current) {
      lastTriggerTime.current = now;
      fetchNextPageRef.current();
    }
  }, []);

  const registerRefresh = useCallback((refresh: () => void) => {
    refreshRef.current = refresh;
  }, []);

  const triggerRefresh = useCallback(() => {
    if (refreshRef.current) {
      refreshRef.current();
    }
  }, []);

  const contextValue = useMemo(
    () => ({ registerFetchNextPage, triggerFetchNextPage, registerRefresh, triggerRefresh }),
    [registerFetchNextPage, triggerFetchNextPage, registerRefresh, triggerRefresh],
  );

  return <ProfilePostsContext.Provider value={contextValue}>{children}</ProfilePostsContext.Provider>;
};

export const useProfilePosts = () => {
  const context = useContext(ProfilePostsContext);
  if (!context) {
    throw new Error('useProfilePosts must be used within ProfilePostsProvider');
  }
  return context;
};

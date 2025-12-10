import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export interface UseSearchHistoryReturn {
  searchHistory: string[];
  isLoading: boolean;
  addToHistory: (query: string) => Promise<void>;
  removeFromHistory: (query: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const useSearchHistory = (): UseSearchHistoryReturn => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (stored) {
          setSearchHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to AsyncStorage
  const saveHistory = useCallback(async (history: string[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, []);

  const addToHistory = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      let newHistory: string[] = [];
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase());
        newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        return newHistory;
      });
      await saveHistory(newHistory);
    },
    [saveHistory],
  );

  const removeFromHistory = useCallback(
    async (query: string) => {
      let newHistory: string[] = [];
      setSearchHistory((prev) => {
        newHistory = prev.filter((item) => item !== query);
        return newHistory;
      });
      await saveHistory(newHistory);
    },
    [saveHistory],
  );

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  return {
    searchHistory,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};

export default useSearchHistory;

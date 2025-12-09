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

  // Load history from AsyncStorage on mount
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

  // Add a query to history (no duplicates, max items)
  const addToHistory = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      setSearchHistory((prev) => {
        // Remove if already exists to avoid duplicates
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase());
        // Add to beginning and limit to max items
        const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        saveHistory(newHistory);
        return newHistory;
      });
    },
    [saveHistory],
  );

  // Remove a specific query from history
  const removeFromHistory = useCallback(
    async (query: string) => {
      setSearchHistory((prev) => {
        const newHistory = prev.filter((item) => item !== query);
        saveHistory(newHistory);
        return newHistory;
      });
    },
    [saveHistory],
  );

  // Clear all history
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

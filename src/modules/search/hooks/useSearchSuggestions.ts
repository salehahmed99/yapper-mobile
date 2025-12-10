import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions } from '../services/searchService';

interface UseSearchSuggestionsOptions {
  query: string;
  username?: string;
  enabled?: boolean;
}

export const useSearchSuggestions = (options: UseSearchSuggestionsOptions) => {
  const { query, username, enabled = true } = options;

  return useQuery({
    queryKey: ['searchSuggestions', query, username],
    queryFn: () => getSearchSuggestions({ query, username }),
    enabled: enabled && query.length > 0,
    staleTime: 0,
    gcTime: 0,
  });
};

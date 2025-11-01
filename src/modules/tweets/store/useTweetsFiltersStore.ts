import { create } from 'zustand';
import { ITweetFilters } from '../types';

interface ITweetsFiltersStore {
  filters: ITweetFilters;
  addFilters: (newFilters: ITweetFilters) => void;
  resetFilters: () => void;
}

export const useTweetsFiltersStore = create<ITweetsFiltersStore>()((set) => ({
  filters: { limit: 10 },
  addFilters: (newFilters: ITweetFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: {} }),
}));

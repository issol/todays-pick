import { create } from 'zustand';
import type { Restaurant } from '@/lib/naver/types';
import { MAX_RETRIES } from '@/lib/utils/constants';

interface PickState {
  // State
  currentPick: Restaurant | null;
  alternatives: Restaurant[];
  retryCount: number;
  isSearching: boolean;
  isPicking: boolean;
  error: string | null;
  searchResults: Restaurant[];

  // Actions
  setCurrentPick: (pick: Restaurant | null) => void;
  setAlternatives: (alts: Restaurant[]) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  setIsSearching: (v: boolean) => void;
  setIsPicking: (v: boolean) => void;
  setError: (error: string | null) => void;
  setSearchResults: (results: Restaurant[]) => void;
  reset: () => void;
}

export const usePickStore = create<PickState>((set) => ({
  // Initial state
  currentPick: null,
  alternatives: [],
  retryCount: 0,
  isSearching: false,
  isPicking: false,
  error: null,
  searchResults: [],

  // Actions
  setCurrentPick: (pick) => set({ currentPick: pick }),
  setAlternatives: (alts) => set({ alternatives: alts }),
  incrementRetry: () =>
    set((state) => ({
      retryCount: Math.min(state.retryCount + 1, MAX_RETRIES),
    })),
  resetRetry: () => set({ retryCount: 0 }),
  setIsSearching: (v) => set({ isSearching: v }),
  setIsPicking: (v) => set({ isPicking: v }),
  setError: (error) => set({ error }),
  setSearchResults: (results) => set({ searchResults: results }),
  reset: () =>
    set({
      currentPick: null,
      alternatives: [],
      retryCount: 0,
      isSearching: false,
      isPicking: false,
      error: null,
      searchResults: [],
    }),
}));

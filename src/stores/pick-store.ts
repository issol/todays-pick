import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  lastPickDate: string | null;
  hasSearched: boolean;

  // Actions
  setCurrentPick: (pick: Restaurant | null) => void;
  setAlternatives: (alts: Restaurant[]) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  setIsSearching: (v: boolean) => void;
  setIsPicking: (v: boolean) => void;
  setError: (error: string | null) => void;
  setSearchResults: (results: Restaurant[]) => void;
  setHasSearched: (v: boolean) => void;
  reset: () => void;
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export const usePickStore = create<PickState>()(
  persist(
    (set) => ({
      // Initial state
      currentPick: null,
      alternatives: [],
      retryCount: 0,
      isSearching: false,
      isPicking: false,
      error: null,
      searchResults: [],
      lastPickDate: null,
      hasSearched: false,

      // Actions
      setCurrentPick: (pick) => set({ currentPick: pick, lastPickDate: getTodayString() }),
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
      setHasSearched: (v) => set({ hasSearched: v }),
      reset: () =>
        set({
          currentPick: null,
          alternatives: [],
          retryCount: 0,
          isSearching: false,
          isPicking: false,
          error: null,
          searchResults: [],
          lastPickDate: null,
          hasSearched: false,
        }),
    }),
    {
      name: 'todays-pick-store',
      partialize: (state) => ({
        currentPick: state.currentPick,
        alternatives: state.alternatives,
        searchResults: state.searchResults,
        retryCount: state.retryCount,
        lastPickDate: state.lastPickDate,
        hasSearched: state.hasSearched,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Reset all pick state if it's a new day
        const today = getTodayString();
        if (state.lastPickDate !== today) {
          state.currentPick = null;
          state.alternatives = [];
          state.searchResults = [];
          state.retryCount = 0;
          state.lastPickDate = null;
          state.hasSearched = false;
        }
      },
    }
  )
);

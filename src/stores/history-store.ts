import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PickHistoryItem {
  id: string;
  restaurantName: string;
  category: string;
  pickedAt: string;
  rating?: number;
}

interface HistoryState {
  items: PickHistoryItem[];
  addItem: (item: PickHistoryItem) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'todays-pick-history',
    }
  )
);

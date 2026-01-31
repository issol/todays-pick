import { create } from 'zustand';
import type { Restaurant } from '@/lib/naver/types';

interface FavoritesState {
  favorites: Restaurant[];
  isLoading: boolean;
  hasFetched: boolean;

  fetchFavorites: () => Promise<void>;
  addFavorite: (restaurant: Restaurant) => Promise<void>;
  removeFavorite: (restaurantId: string) => Promise<void>;
  isFavorite: (restaurantId: string) => boolean;
  toggleFavorite: (restaurant: Restaurant) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: true,
  hasFetched: false,

  fetchFavorites: async () => {
    if (get().hasFetched) return;
    try {
      set({ isLoading: true });
      const res = await fetch('/api/favorites');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      set({ favorites: data.favorites ?? [], hasFetched: true });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      set({ favorites: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addFavorite: async (restaurant: Restaurant) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    set((state) => ({ favorites: [restaurant, ...state.favorites] }));
  },

  removeFavorite: async (restaurantId: string) => {
    const res = await fetch(`/api/favorites?restaurantId=${restaurantId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    set((state) => ({ favorites: state.favorites.filter((fav) => fav.id !== restaurantId) }));
  },

  isFavorite: (restaurantId: string) => {
    return get().favorites.some((fav) => fav.id === restaurantId);
  },

  toggleFavorite: async (restaurant: Restaurant) => {
    if (get().isFavorite(restaurant.id)) {
      await get().removeFavorite(restaurant.id);
    } else {
      await get().addFavorite(restaurant);
    }
  },
}));

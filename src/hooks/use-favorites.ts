'use client';

import { useEffect } from 'react';
import { useFavoritesStore } from '@/stores/favorites-store';

export function useFavorites() {
  const store = useFavoritesStore();

  useEffect(() => {
    store.fetchFavorites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    favorites: store.favorites,
    isLoading: store.isLoading,
    fetchFavorites: store.fetchFavorites,
    addFavorite: store.addFavorite,
    removeFavorite: store.removeFavorite,
    isFavorite: store.isFavorite,
    toggleFavorite: store.toggleFavorite,
  };
}

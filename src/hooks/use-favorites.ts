'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant } from '@/lib/naver/types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/favorites');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setFavorites(data.favorites ?? []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (restaurant: Restaurant) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setFavorites(prev => [restaurant, ...prev]);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, []);

  const removeFavorite = useCallback(async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/favorites?restaurantId=${restaurantId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, []);

  const isFavorite = useCallback((restaurantId: string): boolean => {
    return favorites.some(fav => fav.id === restaurantId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (restaurant: Restaurant) => {
    if (isFavorite(restaurant.id)) {
      await removeFavorite(restaurant.id);
    } else {
      await addFavorite(restaurant);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

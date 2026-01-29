'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Json } from '@/lib/supabase/types';
import type { Restaurant } from '@/lib/naver/types';

interface FavoriteRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_data: Restaurant;
  created_at: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const restaurantData = (data as unknown as FavoriteRow[])?.map(fav => fav.restaurant_data) || [];
      setFavorites(restaurantData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const addFavorite = useCallback(async (restaurant: Restaurant) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          restaurant_data: restaurant as unknown as Json,
        } as never);

      if (error) throw error;

      setFavorites(prev => [restaurant, ...prev]);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [supabase]);

  const removeFavorite = useCallback(async (restaurantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [supabase]);

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

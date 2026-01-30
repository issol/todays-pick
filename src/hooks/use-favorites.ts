'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
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
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

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
  }, [supabase, user]);

  const addFavorite = useCallback(async (restaurant: Restaurant) => {
    if (!user) throw new Error('User not authenticated');

    try {
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
  }, [supabase, user]);

  const removeFavorite = useCallback(async (restaurantId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
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
  }, [supabase, user]);

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
    if (!authLoading) {
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

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

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { Database } from '@/lib/supabase/types';
import type { Restaurant } from '@/lib/naver/types';

type BlacklistRow = Database['public']['Tables']['blacklist']['Row'];

interface BlacklistItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  reason: string | null;
  createdAt: string;
}

export function useBlacklist() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchBlacklist = useCallback(async () => {
    if (!user) {
      setBlacklist([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blacklist')
        .select('id, restaurant_id, restaurant_name, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data as BlacklistRow[] | null;
      setBlacklist(
        (rows || []).map((item) => ({
          id: item.id,
          restaurantId: item.restaurant_id,
          restaurantName: item.restaurant_name,
          reason: item.reason,
          createdAt: item.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching blacklist:', error);
      setBlacklist([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  const addToBlacklist = useCallback(
    async (restaurant: Restaurant, reason?: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { error } = await supabase.from('blacklist').insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          reason: reason || null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (error) throw error;

        await fetchBlacklist();
      } catch (error) {
        console.error('Error adding to blacklist:', error);
        throw error;
      }
    },
    [supabase, user, fetchBlacklist]
  );

  const removeFromBlacklist = useCallback(
    async (restaurantId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { error } = await supabase
          .from('blacklist')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;

        await fetchBlacklist();
      } catch (error) {
        console.error('Error removing from blacklist:', error);
        throw error;
      }
    },
    [supabase, user, fetchBlacklist]
  );

  const isBlacklisted = useCallback(
    (restaurantId: string) => {
      return blacklist.some((item) => item.restaurantId === restaurantId);
    },
    [blacklist]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchBlacklist();
    }
  }, [authLoading, fetchBlacklist]);

  return {
    blacklist,
    isLoading,
    fetchBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
  };
}

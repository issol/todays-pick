'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { Restaurant } from '@/lib/naver/types';

type PickHistoryRow = Database['public']['Tables']['picks_history']['Row'];

interface UseHistoryResult {
  history: PickHistoryRow[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  fetchHistory: (page: number) => Promise<void>;
  addToHistory: (restaurant: Restaurant, retryCount: number) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  totalCount: number;
}

const PAGE_SIZE = 20;

export function useHistory(): UseHistoryResult {
  const [history, setHistory] = useState<PickHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get total count
      const { count } = await supabase
        .from('picks_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalCount(count || 0);

      // Fetch paginated history
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: fetchError } = await supabase
        .from('picks_history')
        .select('*')
        .eq('user_id', user.id)
        .order('picked_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (page === 0) {
        setHistory(data || []);
      } else {
        setHistory(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch history'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addToHistory = useCallback(async (restaurant: Restaurant, retryCount: number) => {
    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error: insertError } = await supabase
        .from('picks_history')
        .insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          restaurant_data: restaurant as unknown as Database['public']['Tables']['picks_history']['Insert']['restaurant_data'],
          retry_count: retryCount,
          was_accepted: false, // Will be updated when user accepts/skips
        } as never);

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Failed to add to history:', err);
      throw err;
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from('picks_history')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setHistory(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      throw err;
    }
  }, []);

  return {
    history,
    loading,
    error,
    hasMore,
    fetchHistory,
    addToHistory,
    deleteHistoryItem,
    totalCount,
  };
}

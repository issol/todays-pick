'use client';

import { useState, useCallback } from 'react';
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
      const res = await fetch(`/api/picks-history?page=${page}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setTotalCount(data.totalCount ?? 0);

      if (page === 0) {
        setHistory(data.history ?? []);
      } else {
        setHistory(prev => [...prev, ...(data.history ?? [])]);
      }

      setHasMore(data.hasMore ?? false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch history'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addToHistory = useCallback(async (restaurant: Restaurant, retryCount: number) => {
    try {
      const res = await fetch('/api/picks-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant, retryCount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to add to history:', err);
      throw err;
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/picks-history?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

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

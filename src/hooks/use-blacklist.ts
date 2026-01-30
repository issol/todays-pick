'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant } from '@/lib/naver/types';

interface BlacklistItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  reason: string | null;
  createdAt: string;
}

export function useBlacklist() {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlacklist = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/blacklist');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setBlacklist(data.blacklist ?? []);
    } catch (error) {
      console.error('Error fetching blacklist:', error);
      setBlacklist([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToBlacklist = useCallback(async (restaurant: Restaurant, reason?: string) => {
    try {
      const res = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await fetchBlacklist();
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      throw error;
    }
  }, [fetchBlacklist]);

  const removeFromBlacklist = useCallback(async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/blacklist?restaurantId=${restaurantId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setBlacklist(prev => prev.filter(item => item.restaurantId !== restaurantId));
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      throw error;
    }
  }, []);

  const isBlacklisted = useCallback((restaurantId: string) => {
    return blacklist.some(item => item.restaurantId === restaurantId);
  }, [blacklist]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  return {
    blacklist,
    isLoading,
    fetchBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
  };
}

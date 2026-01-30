'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { usePickStore } from '@/stores/pick-store';
import { useHistory } from '@/hooks/use-history';
import { reverseGeocode } from '@/lib/naver/maps';
import type { Restaurant } from '@/lib/naver/types';

interface SearchRestaurantsRequest {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  areaName?: string;
}

export function useRandomPick() {
  const { currentLocation, selectedCategories, radius } = useAppStore();
  const {
    currentPick,
    searchResults,
    retryCount,
    setCurrentPick,
    setAlternatives,
    setSearchResults,
    setIsSearching,
    setIsPicking,
    setError,
    incrementRetry,
    setHasSearched,
  } = usePickStore();
  const { addToHistory } = useHistory();

  const searchAndPick = useCallback(async (): Promise<Restaurant | null> => {
    if (!currentLocation) {
      setError('위치 정보가 필요합니다');
      return null;
    }

    if (selectedCategories.length === 0) {
      setError('카테고리를 선택해주세요');
      return null;
    }

    try {
      setIsSearching(true);
      setError(null);

      // Get area name for location-aware search
      const areaName = await reverseGeocode(currentLocation.lat, currentLocation.lng).catch(() => null);

      // Step 1: Search restaurants (now returns ~100 results with caching)
      const searchPayload: SearchRestaurantsRequest = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius,
        categories: selectedCategories,
        ...(areaName && { areaName }),
      };

      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const searchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search-restaurants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(searchPayload),
        }
      );

      if (!searchResponse.ok) {
        throw new Error('맛집 검색에 실패했습니다');
      }

      const searchData = await searchResponse.json();
      const restaurants: Restaurant[] = searchData.restaurants ?? searchData;
      setSearchResults(restaurants);
      setHasSearched(true);

      if (restaurants.length === 0) {
        setIsSearching(false);
        return null;
      }

      // Step 2: Pick random from results client-side
      setIsPicking(true);
      const picked = weightedRandomPickClient(restaurants);
      if (picked) {
        setCurrentPick(picked);
        // Select up to 3 alternatives
        const alternatives = restaurants
          .filter(r => r.id !== picked.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setAlternatives(alternatives);

        // Save to picks history (fire-and-forget, don't block UI)
        addToHistory(picked, 0).catch((err) => console.error('[PickHistory] save failed:', err));
      }

      return picked;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(message);
      return null;
    } finally {
      setIsSearching(false);
      setIsPicking(false);
    }
  }, [
    currentLocation,
    selectedCategories,
    radius,
    setIsSearching,
    setIsPicking,
    setError,
    setSearchResults,
    setCurrentPick,
    setAlternatives,
    setHasSearched,
    addToHistory,
  ]);

  /**
   * Retry pick — fully client-side, no API calls.
   * Uses searchResults already in memory with weighted random selection.
   */
  const retryPick = useCallback((): Restaurant | null => {
    if (searchResults.length === 0) {
      setError('검색 결과가 없습니다. 다시 검색해주세요');
      return null;
    }

    try {
      setIsPicking(true);
      setError(null);

      // Exclude current pick
      const excludeId = currentPick?.id;
      const eligible = excludeId
        ? searchResults.filter(r => r.id !== excludeId)
        : searchResults;

      if (eligible.length === 0) {
        setError('더 이상 추천할 식당이 없습니다');
        return null;
      }

      const picked = weightedRandomPickClient(eligible);
      if (picked) {
        setCurrentPick(picked);
        const alternatives = eligible
          .filter(r => r.id !== picked.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setAlternatives(alternatives);
        incrementRetry();

        // Save to picks history (fire-and-forget)
        addToHistory(picked, retryCount + 1).catch((err) => console.error('[PickHistory] retry save failed:', err));
      }

      return picked;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(message);
      return null;
    } finally {
      setIsPicking(false);
    }
  }, [
    searchResults,
    currentPick,
    setIsPicking,
    setError,
    setCurrentPick,
    setAlternatives,
    incrementRetry,
    addToHistory,
    retryCount,
  ]);

  return {
    searchAndPick,
    retryPick,
    retryCount,
  };
}

/**
 * Weighted random pick on the client side.
 * Uses curationScore as weight (minimum 1).
 */
function weightedRandomPickClient(restaurants: Restaurant[]): Restaurant | null {
  if (restaurants.length === 0) return null;
  if (restaurants.length === 1) return restaurants[0];

  const weights = restaurants.map(r => Math.max(r.curationScore ?? 1, 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return restaurants[i];
    }
  }

  return restaurants[restaurants.length - 1];
}

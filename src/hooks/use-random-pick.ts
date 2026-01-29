'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { usePickStore } from '@/stores/pick-store';
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

interface PickRandomRequest {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  userId?: string;
  areaName?: string;
}

interface PickRandomResponse {
  picked: Restaurant;
  alternatives: Restaurant[];
  timestamp: string;
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
  } = usePickStore();

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

      // Step 1: Search restaurants
      const searchPayload: SearchRestaurantsRequest = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius,
        categories: selectedCategories,
        ...(areaName && { areaName }),
      };

      const searchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search-restaurants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify(searchPayload),
        }
      );

      if (!searchResponse.ok) {
        throw new Error('맛집 검색에 실패했습니다');
      }

      const restaurants: Restaurant[] = await searchResponse.json();
      setSearchResults(restaurants);

      if (restaurants.length === 0) {
        setError('검색 결과가 없습니다');
        setIsSearching(false);
        return null;
      }

      // Step 2: Pick random restaurant
      setIsPicking(true);
      const pickPayload: PickRandomRequest = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius,
        categories: selectedCategories,
        excludeIds: currentPick ? [currentPick.id] : [],
        ...(areaName && { areaName }),
      };

      const pickResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pick-random`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify(pickPayload),
        }
      );

      if (!pickResponse.ok) {
        throw new Error('랜덤 선택에 실패했습니다');
      }

      const result: PickRandomResponse = await pickResponse.json();
      setCurrentPick(result.picked);
      setAlternatives(result.alternatives);

      return result.picked;
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
    currentPick,
    setIsSearching,
    setIsPicking,
    setError,
    setSearchResults,
    setCurrentPick,
    setAlternatives,
  ]);

  const retryPick = useCallback(async (): Promise<Restaurant | null> => {
    if (searchResults.length === 0) {
      setError('검색 결과가 없습니다. 다시 검색해주세요');
      return null;
    }

    try {
      setIsPicking(true);
      setError(null);

      if (!currentLocation) {
        setError('위치 정보가 필요합니다');
        return null;
      }

      const areaName = await reverseGeocode(currentLocation.lat, currentLocation.lng).catch(() => null);

      const pickPayload: PickRandomRequest = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius,
        categories: selectedCategories,
        excludeIds: currentPick ? [currentPick.id] : [],
        ...(areaName && { areaName }),
      };

      const pickResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pick-random`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify(pickPayload),
        }
      );

      if (!pickResponse.ok) {
        throw new Error('랜덤 선택에 실패했습니다');
      }

      const result: PickRandomResponse = await pickResponse.json();
      setCurrentPick(result.picked);
      setAlternatives(result.alternatives);
      incrementRetry();

      return result.picked;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(message);
      return null;
    } finally {
      setIsPicking(false);
    }
  }, [
    currentLocation,
    selectedCategories,
    radius,
    currentPick,
    setIsPicking,
    setError,
    setCurrentPick,
    setAlternatives,
    incrementRetry,
  ]);

  return {
    searchAndPick,
    retryPick,
    retryCount,
  };
}

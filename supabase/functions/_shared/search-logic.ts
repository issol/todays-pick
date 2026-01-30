import { searchRestaurants } from './naver-api.ts';
import { findCachedSearch, loadCachedRestaurants, cacheSearchResults } from './cache.ts';
import type { Restaurant } from './types.ts';

type RestaurantWithoutScore = Omit<Restaurant, 'curationScore'>;

const CATEGORY_QUERIES: Record<string, string> = {
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  snacks: '분식',
  cafe: '카페 디저트',
  fastfood: '패스트푸드',
  latenight: '야식',
};

interface SearchWithCacheOptions {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  areaName?: string;
  enrichLimit?: number;
}

/**
 * Search restaurants with DB cache layer.
 *
 * For each category:
 * 1. Check if a recent search exists within 500m → use cached results
 * 2. If not cached → search Naver API with pagination (4 pages × 5 = 20 per category)
 * 3. Cache results in DB for future use
 *
 * Returns deduplicated, distance-sorted restaurants.
 */
export async function searchWithCache(
  options: SearchWithCacheOptions
): Promise<RestaurantWithoutScore[]> {
  const {
    lat,
    lng,
    radius,
    categories,
    excludeIds = [],
    areaName,
    enrichLimit = 30,
  } = options;

  const allRestaurants: RestaurantWithoutScore[] = [];
  const seenIds = new Set<string>();

  for (const category of categories) {
    const baseQuery = CATEGORY_QUERIES[category];
    if (!baseQuery) {
      console.warn(`Unknown category: ${category}`);
      continue;
    }

    try {
      // Step 1: Check cache
      const cachedIds = await findCachedSearch(lat, lng, category);

      if (cachedIds && cachedIds.length > 0) {
        console.log(`Cache HIT for category "${category}": ${cachedIds.length} results`);
        const cached = await loadCachedRestaurants(cachedIds, lat, lng);
        for (const r of cached) {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            allRestaurants.push(r);
          }
        }
        continue;
      }

      // Step 2: Cache MISS → search Naver API with query expansion
      console.log(`Cache MISS for category "${category}", searching Naver API...`);
      const query = areaName ? `${areaName} ${baseQuery} 맛집` : baseQuery;

      // Calculate how many restaurants still need enrichment
      const enrichedSoFar = allRestaurants.filter(r => r.rating > 0 || r.imageUrl).length;
      const remainingEnrichBudget = Math.max(0, enrichLimit - enrichedSoFar);

      const results = await searchRestaurants(query, lat, lng, radius, remainingEnrichBudget, areaName, baseQuery);

      // Step 3: Cache results
      await cacheSearchResults(lat, lng, category, areaName, results).catch(err => {
        console.warn(`Failed to cache results for "${category}":`, err);
      });

      // Deduplicate
      for (const restaurant of results) {
        if (!seenIds.has(restaurant.id)) {
          seenIds.add(restaurant.id);
          allRestaurants.push(restaurant);
        }
      }
    } catch (error) {
      console.error(`Error searching category ${category}:`, error);
    }
  }

  // Filter out excluded IDs
  const filtered = allRestaurants.filter(r => !excludeIds.includes(r.id));

  // Sort by distance
  filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  return filtered;
}

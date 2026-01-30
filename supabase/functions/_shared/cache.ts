import { getSupabaseClient } from './supabase-client.ts';
import type { Restaurant } from './types.ts';

const CACHE_TTL_DAYS = 7;
const NEARBY_RADIUS_METERS = 500;

type RestaurantWithoutScore = Omit<Restaurant, 'curationScore'>;

interface CachedRestaurantRow {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  road_address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  blog_review_count: number;
  image_url: string | null;
  naver_place_url: string | null;
  is_enriched: boolean;
}

/**
 * Find a cached search for the same area+category within NEARBY_RADIUS_METERS.
 * Returns cached restaurant IDs if found and not expired.
 */
export async function findCachedSearch(
  lat: number,
  lng: number,
  category: string
): Promise<string[] | null> {
  const supabase = getSupabaseClient();
  const ttlCutoff = new Date();
  ttlCutoff.setDate(ttlCutoff.getDate() - CACHE_TTL_DAYS);

  const { data, error } = await supabase
    .rpc('find_nearby_search_cache', {
      p_lat: lat,
      p_lng: lng,
      p_category: category,
      p_radius_meters: NEARBY_RADIUS_METERS,
      p_min_searched_at: ttlCutoff.toISOString(),
    });

  if (error) {
    console.warn('Cache lookup failed:', error.message);
    return null;
  }

  if (data && data.length > 0) {
    return data[0].result_ids;
  }

  return null;
}

/**
 * Load cached restaurants by their IDs.
 */
export async function loadCachedRestaurants(
  ids: string[],
  userLat?: number,
  userLng?: number
): Promise<RestaurantWithoutScore[]> {
  if (ids.length === 0) return [];

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cached_restaurants')
    .select('*')
    .in('id', ids);

  if (error) {
    console.warn('Failed to load cached restaurants:', error.message);
    return [];
  }

  return (data as CachedRestaurantRow[]).map(row => rowToRestaurant(row, userLat, userLng));
}

/**
 * Save restaurants to cache and record the search.
 */
export async function cacheSearchResults(
  lat: number,
  lng: number,
  category: string,
  areaName: string | undefined,
  restaurants: RestaurantWithoutScore[]
): Promise<void> {
  if (restaurants.length === 0) return;

  const supabase = getSupabaseClient();

  // Upsert restaurants
  // location is auto-computed by DB trigger from lat/lng
  const rows = restaurants.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    address: r.address,
    road_address: r.roadAddress,
    phone: r.phone,
    latitude: r.latitude,
    longitude: r.longitude,
    rating: r.rating,
    review_count: r.reviewCount,
    blog_review_count: r.blogReviewCount,
    image_url: r.imageUrl || null,
    naver_place_url: r.naverPlaceUrl,
    is_enriched: r.rating > 0 || (r.imageUrl ? true : false),
    cached_at: new Date().toISOString(),
  }));

  // Upsert in small batches to avoid one bad row failing the entire batch
  const BATCH_SIZE = 5;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await supabase
      .from('cached_restaurants')
      .upsert(batch, { onConflict: 'id' });

    if (upsertError) {
      console.warn(`Failed to cache restaurants batch ${i / BATCH_SIZE + 1} (${batch.length} rows):`, upsertError.message);
      // Try individual inserts for the failed batch
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from('cached_restaurants')
          .upsert(row, { onConflict: 'id' });
        if (singleError) {
          console.warn(`Failed to cache restaurant "${row.name}" (${row.id}):`, singleError.message);
        }
      }
    }
  }

  // Record the search
  const resultIds = restaurants.map(r => r.id);
  // location is auto-computed by DB trigger from lat/lng
  const { error: searchError } = await supabase
    .from('search_cache')
    .insert({
      latitude: lat,
      longitude: lng,
      category,
      area_name: areaName || null,
      result_ids: resultIds,
      total_results: resultIds.length,
    });

  if (searchError) {
    console.warn('Failed to cache search:', searchError.message);
  }
}

/**
 * Convert a database row to a Restaurant object.
 */
function rowToRestaurant(
  row: CachedRestaurantRow,
  userLat?: number,
  userLng?: number
): RestaurantWithoutScore {
  let distance: number | undefined;
  if (userLat !== undefined && userLng !== undefined) {
    distance = haversineDistance(userLat, userLng, row.latitude, row.longitude);
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    address: row.address || '',
    roadAddress: row.road_address || '',
    phone: row.phone || '',
    latitude: row.latitude,
    longitude: row.longitude,
    distance,
    rating: row.rating,
    reviewCount: row.review_count,
    blogReviewCount: row.blog_review_count,
    imageUrl: row.image_url || undefined,
    naverPlaceUrl: row.naver_place_url || `https://map.naver.com/v5/search/${encodeURIComponent(row.name)}`,
  };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

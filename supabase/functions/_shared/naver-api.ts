import type { NaverSearchLocalResponse, NaverSearchLocalItem, Restaurant } from './types.ts';

const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

interface SearchOptions {
  query: string;
  display?: number;
  start?: number;
  sort?: 'random' | 'comment';
}

/**
 * Search for local restaurants via Naver Search API.
 */
export async function searchLocalRestaurants(
  options: SearchOptions
): Promise<NaverSearchLocalResponse> {
  const clientId = Deno.env.get('NAVER_CLIENT_ID');
  const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing Naver API credentials');
  }

  const { query, display = 5, start = 1, sort = 'comment' } = options;

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: String(start),
    sort,
  });

  const response = await fetch(`${NAVER_SEARCH_API_URL}?${params}`, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Naver API rate limit exceeded');
    }
    throw new Error(`Naver Search API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convert Naver katec coordinates (mapx, mapy) to WGS84 latitude/longitude.
 */
export function convertNaverCoords(mapx: string, mapy: string): { latitude: number; longitude: number } {
  const x = parseInt(mapx, 10);
  const y = parseInt(mapy, 10);

  // Naver mapx/mapy are in 1/10,000,000 degree format
  return {
    longitude: x / 10000000,
    latitude: y / 10000000,
  };
}

/**
 * Strip HTML tags from Naver search results
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Parse a Naver search item into our internal Restaurant type.
 */
export function parseNaverSearchItem(
  item: NaverSearchLocalItem,
  userLat?: number,
  userLng?: number
): Omit<Restaurant, 'curationScore'> {
  const { latitude, longitude } = convertNaverCoords(item.mapx, item.mapy);
  const name = stripHtmlTags(item.title);

  const distance = userLat && userLng
    ? calculateDistance(userLat, userLng, latitude, longitude)
    : undefined;

  // Extract place ID from the link URL
  const placeIdMatch = item.link.match(/place\/(\d+)/);
  const placeId = placeIdMatch ? placeIdMatch[1] : `naver_${name}_${item.address}`;

  return {
    id: placeId,
    name,
    category: item.category,
    address: item.address,
    roadAddress: item.roadAddress,
    phone: item.telephone,
    latitude,
    longitude,
    distance,
    rating: 0, // Will be enriched
    reviewCount: 0, // Will be enriched
    blogReviewCount: 0, // Will be enriched
    imageUrl: undefined, // Will be enriched
    naverPlaceUrl: item.link || `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
  };
}

/**
 * Fetch place detail from Naver Place page to get rating, reviews, and images.
 * Scrapes the place home page and extracts embedded __NEXT_DATA__ JSON.
 */
async function fetchPlaceDetail(
  restaurant: Omit<Restaurant, 'curationScore'>
): Promise<Omit<Restaurant, 'curationScore'>> {
  // Only fetch if we have a numeric place ID (not a fallback ID)
  if (!restaurant.id || restaurant.id.startsWith('naver_')) {
    return restaurant;
  }

  try {
    const placeUrl = `https://pcmap.place.naver.com/restaurant/${restaurant.id}/home`;
    const response = await fetch(placeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });

    if (!response.ok) {
      console.warn(`Place page returned ${response.status} for ${restaurant.id}`);
      return restaurant;
    }

    const html = await response.text();

    let rating = restaurant.rating;
    let reviewCount = restaurant.reviewCount;
    let blogReviewCount = restaurant.blogReviewCount;
    let imageUrl = restaurant.imageUrl;

    // Extract visitor review rating: "visitorReviewScore":"4.12" or similar patterns
    const ratingMatch = html.match(/"visitorReviewScore"\s*:\s*"?([\d.]+)"?/);
    if (ratingMatch) {
      const parsed = parseFloat(ratingMatch[1]);
      if (!isNaN(parsed) && parsed > 0) rating = parsed;
    }

    // Extract visitor review count: "visitorReviewCount":123 or "totalCount":123
    const reviewCountMatch = html.match(/"visitorReviewCount"\s*:\s*(\d+)/);
    if (reviewCountMatch) {
      reviewCount = parseInt(reviewCountMatch[1], 10);
    }

    // Extract blog review count
    const blogCountMatch = html.match(/"blogCafeReviewCount"\s*:\s*(\d+)/);
    if (blogCountMatch) {
      blogReviewCount = parseInt(blogCountMatch[1], 10);
    }

    // Extract image URL from og:image meta tag or image patterns
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1];
    } else {
      // Try to find image from the page data
      const imageMatch = html.match(/"imageUrl"\s*:\s*"(https?:\/\/[^"]+)"/);
      if (imageMatch && imageMatch[1]) {
        imageUrl = imageMatch[1];
      }
    }

    return {
      ...restaurant,
      rating,
      reviewCount,
      blogReviewCount,
      imageUrl,
    };
  } catch (error) {
    console.error(`Error fetching place detail for ${restaurant.name} (${restaurant.id}):`, error);
    return restaurant;
  }
}

/**
 * Search restaurants around a location with category filter.
 */
export async function searchRestaurants(
  query: string,
  lat: number,
  lng: number,
  _radius: number
): Promise<Omit<Restaurant, 'curationScore'>[]> {
  const response = await searchLocalRestaurants({
    query,
    display: 5, // Naver Local Search API max useful results
    sort: 'comment',
  });

  // Parse and sort by distance (no hard cutoff — area name in query ensures locality)
  const restaurants = response.items
    .map(item => parseNaverSearchItem(item, lat, lng))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  // Enrich with place detail data (parallel for speed)
  const enriched = await Promise.all(
    restaurants.map(r => fetchPlaceDetail(r))
  );

  return enriched;
}

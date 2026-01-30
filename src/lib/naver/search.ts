import type { NaverSearchLocalResponse, NaverSearchLocalItem, Restaurant } from "./types";

const NAVER_SEARCH_API_URL = "https://openapi.naver.com/v1/search/local.json";

interface SearchOptions {
  query: string;
  display?: number;
  start?: number;
  sort?: "random" | "comment";
}

/**
 * Search for local restaurants via Naver Search API.
 * This should only be called from server-side (Edge Functions) to protect API keys.
 */
export async function searchLocalRestaurants(
  options: SearchOptions,
  credentials: { clientId: string; clientSecret: string }
): Promise<NaverSearchLocalResponse> {
  const { query, display = 5, start = 1, sort = "comment" } = options;
  const { clientId, clientSecret } = credentials;

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: String(start),
    sort,
  });

  const response = await fetch(`${NAVER_SEARCH_API_URL}?${params}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new NaverApiError("RATE_LIMIT", "Naver API rate limit exceeded");
    }
    throw new NaverApiError(
      "API_ERROR",
      `Naver Search API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Convert Naver katec coordinates (mapx, mapy) to WGS84 latitude/longitude.
 * Naver Search Local API returns coordinates in katec format.
 */
export function convertNaverCoords(mapx: string, mapy: string): { latitude: number; longitude: number } {
  // Naver Search Local API returns coordinates as strings
  // These are in a format where they need to be divided to get proper lat/lng
  const x = parseInt(mapx, 10);
  const y = parseInt(mapy, 10);

  // Naver mapx/mapy are in 1/10,000,000 degree format
  return {
    longitude: x / 10000000,
    latitude: y / 10000000,
  };
}

/**
 * Strip HTML tags from Naver search results (title field contains <b> tags)
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
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
 * Note: rating, reviewCount, blogReviewCount are not available from search API
 * and must be enriched from Place API or default values.
 */
export function parseNaverSearchItem(
  item: NaverSearchLocalItem,
  userLat?: number,
  userLng?: number
): Omit<Restaurant, "curationScore"> {
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
    menuInfo: undefined, // Will be enriched
    naverPlaceUrl: item.link || `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
  };
}

// Custom error class for Naver API errors
export class NaverApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "NaverApiError";
  }
}

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
 * Enrich restaurant with image from Naver Image Search API.
 * Tries simplified query first, then falls back to name-only search.
 */
async function fetchImage(
  name: string,
  _address: string,
  clientId: string,
  clientSecret: string
): Promise<string | undefined> {
  const queries = [
    `${name} 맛집`,
    `${name} 음식점`,
  ];

  for (const query of queries) {
    try {
      const params = new URLSearchParams({ query, display: '3', sort: 'sim', filter: 'large' });
      const response = await fetch(
        `https://openapi.naver.com/v1/search/image?${params}`,
        {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
        }
      );
      if (!response.ok) {
        console.warn(`Image search failed for "${query}": ${response.status}`);
        continue;
      }
      const data = await response.json();
      const items = data.items ?? [];
      // Prefer link (full-size image) for better quality, fallback to thumbnail
      for (const item of items) {
        if (item.link) return item.link;
      }
      if (items[0]?.thumbnail) return items[0].thumbnail;
    } catch (err) {
      console.warn(`Image search error for "${query}":`, err);
    }
  }

  return undefined;
}

/**
 * Enrich restaurant with blog review count from Naver Blog Search API.
 */
async function fetchBlogCount(
  name: string,
  address: string,
  clientId: string,
  clientSecret: string
): Promise<number> {
  try {
    const query = `${name} ${address} 리뷰`;
    const params = new URLSearchParams({ query, display: '1', sort: 'sim' });
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?${params}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );
    if (!response.ok) return 0;
    const data = await response.json();
    return data.total || 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch restaurant detail from Naver Place page.
 * Scrapes the __NEXT_DATA__ JSON embedded in the HTML for menu/price info.
 */
async function fetchNaverPlaceInfo(
  placeId: string
): Promise<{ menuInfo?: string; rating?: number; reviewCount?: number; imageUrl?: string }> {
  try {
    // Use Naver Place internal API for structured data
    const url = `https://pcmap.place.naver.com/restaurant/${placeId}/home`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });

    if (!response.ok) return {};

    const html = await response.text();

    // Extract __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!nextDataMatch) return {};

    const nextData = JSON.parse(nextDataMatch[1]);
    const initialState = nextData?.props?.initialState;
    if (!initialState) return {};

    // Navigate to place detail
    const placeDetail = initialState?.place?.detailPlace?.placeDetail;
    if (!placeDetail) return {};

    // Extract menu info
    let menuInfo: string | undefined;
    const menuList = placeDetail.menus ?? placeDetail.menuInfo?.menuList;
    if (menuList && Array.isArray(menuList) && menuList.length > 0) {
      // Format: "메뉴1 가격1, 메뉴2 가격2" (top 5)
      menuInfo = menuList
        .slice(0, 5)
        .map((m: { name?: string; price?: string | number }) => {
          const name = m.name || '';
          const price = m.price ? `${m.price}원` : '';
          return price ? `${name} ${price}` : name;
        })
        .filter(Boolean)
        .join(', ');
    }

    // Extract rating
    const rating = placeDetail.fsasReview?.rating
      ?? placeDetail.visitorReviewScore
      ?? undefined;

    // Extract review count
    const reviewCount = placeDetail.fsasReview?.count
      ?? placeDetail.visitorReviewCount
      ?? undefined;

    // Extract image
    const imageUrl = placeDetail.imageUrl
      ?? placeDetail.images?.[0]?.url
      ?? undefined;

    return {
      menuInfo: menuInfo || undefined,
      rating: typeof rating === 'number' ? rating : undefined,
      reviewCount: typeof reviewCount === 'number' ? reviewCount : undefined,
      imageUrl,
    };
  } catch (err) {
    console.warn(`Naver Place scrape failed for ${placeId}:`, err);
    return {};
  }
}

/**
 * Enrich restaurant data using Naver Place scraping + Search APIs (Image + Blog).
 * Tries Place page first for accurate data, falls back to Search APIs.
 */
async function enrichRestaurantData(
  restaurant: Omit<Restaurant, 'curationScore'>
): Promise<Omit<Restaurant, 'curationScore'>> {
  const clientId = Deno.env.get('NAVER_CLIENT_ID');
  const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');

  if (!clientId || !clientSecret) return restaurant;

  const address = restaurant.roadAddress || restaurant.address;

  // Try Naver Place scraping + Search APIs in parallel
  const isNumericId = /^\d+$/.test(restaurant.id);
  const [placeInfo, imageUrl, blogReviewCount] = await Promise.all([
    isNumericId ? fetchNaverPlaceInfo(restaurant.id) : Promise.resolve({}),
    fetchImage(restaurant.name, address, clientId, clientSecret),
    fetchBlogCount(restaurant.name, address, clientId, clientSecret),
  ]);

  // Use Place data if available, fall back to Search API estimates
  let rating = placeInfo.rating ?? 0;
  let reviewCount = placeInfo.reviewCount ?? 0;

  if (rating === 0) {
    // Estimate rating from blog popularity
    if (blogReviewCount >= 1000) rating = 4.5;
    else if (blogReviewCount >= 500) rating = 4.3;
    else if (blogReviewCount >= 200) rating = 4.1;
    else if (blogReviewCount >= 100) rating = 3.9;
    else if (blogReviewCount >= 50) rating = 3.7;
    else if (blogReviewCount >= 10) rating = 3.5;
  }

  if (reviewCount === 0) {
    reviewCount = Math.round(blogReviewCount * 3);
  }

  return {
    ...restaurant,
    rating,
    reviewCount,
    blogReviewCount: Math.min(blogReviewCount, 9999),
    imageUrl: placeInfo.imageUrl || imageUrl || restaurant.imageUrl,
    menuInfo: placeInfo.menuInfo,
  };
}

/**
 * Sub-query variations per category.
 * Naver Local Search API returns max 5 results per query and ignores pagination.
 * To get more results, we run multiple semantically different queries per category.
 */
const CATEGORY_SUB_QUERIES: Record<string, string[]> = {
  '한식': [
    '한식 맛집', '한식 식당', '한정식', '국밥', '백반', '삼겹살', '갈비', '찌개',
    '비빔밥', '냉면', '칼국수', '설렁탕', '김치찌개', '된장찌개', '불고기', '순두부',
    '쌈밥', '해장국', '보리밥', '제육볶음', '감자탕', '순대국',
  ],
  '중식': [
    '중식 맛집', '중식 식당', '중국집', '짜장면', '짬뽕', '마라탕',
    '양꼬치', '훠궈', '딤섬', '탕수육', '마라샹궈', '중화요리', '볶음밥',
  ],
  '일식': [
    '일식 맛집', '일식 식당', '초밥', '라멘', '돈가스', '우동',
    '이자카야', '사시미', '소바', '카레', '오마카세', '텐동', '규동', '야키토리',
  ],
  '양식': [
    '양식 맛집', '양식 식당', '파스타', '스테이크', '피자', '브런치',
    '리조또', '햄버거', '와인바', '비스트로', '샐러드', '오믈렛', '그릴',
  ],
  '분식': [
    '분식 맛집', '분식 식당', '떡볶이', '김밥', '라면', '순대',
    '만두', '튀김', '쫄면', '우동', '핫도그', '어묵',
  ],
  '카페 디저트': [
    '카페 맛집', '디저트', '케이크', '베이커리', '브런치카페',
    '마카롱', '아이스크림', '와플', '도넛', '빙수', '타르트', '커피 맛집',
  ],
  '패스트푸드': [
    '패스트푸드', '버거', '치킨', '샌드위치', '타코', '핫도그',
    '피자배달', '도시락', '김밥천국', '편의점 도시락',
  ],
  '야식': [
    '야식 맛집', '포장마차', '치킨집', '족발', '보쌈', '곱창',
    '막창', '회', '라면', '양꼬치', '떡볶이 야식', '피자 야식',
  ],
};

/**
 * Search with multiple query variations in parallel for more diverse results.
 * Returns deduplicated items from all sub-queries.
 */
export async function searchLocalRestaurantsExpanded(
  areaName: string | undefined,
  categoryQuery: string
): Promise<NaverSearchLocalItem[]> {
  const subQueries = CATEGORY_SUB_QUERIES[categoryQuery] || [`${categoryQuery} 맛집`, `${categoryQuery} 식당`];
  const prefix = areaName ? `${areaName} ` : '';

  // Run all sub-queries with 'comment' sort (most reviewed)
  const commentRequests = subQueries.map(sq =>
    searchLocalRestaurants({
      query: `${prefix}${sq}`,
      display: 5,
      sort: 'comment',
    }).catch((err) => {
      console.warn(`Sub-query search failed for "${prefix}${sq}":`, err);
      return null;
    })
  );

  // Also run a few queries with 'random' sort for diversity
  const randomQueries = subQueries.slice(0, 3);
  const randomRequests = randomQueries.map(sq =>
    searchLocalRestaurants({
      query: `${prefix}${sq}`,
      display: 5,
      sort: 'random',
    }).catch((err) => {
      console.warn(`Random sub-query search failed for "${prefix}${sq}":`, err);
      return null;
    })
  );

  const responses = await Promise.all([...commentRequests, ...randomRequests]);
  const allItems: NaverSearchLocalItem[] = [];
  const seenKeys = new Set<string>();

  for (const res of responses) {
    if (!res) continue;
    for (const item of res.items) {
      const key = `${item.title}_${item.address}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allItems.push(item);
      }
    }
  }

  return allItems;
}

/**
 * Search restaurants around a location with category filter.
 * Uses query expansion (multiple sub-queries) for more diverse results.
 * @param enrichLimit - Max number of restaurants to enrich with image+blog (default 30)
 */
export async function searchRestaurants(
  query: string,
  lat: number,
  lng: number,
  _radius: number,
  enrichLimit: number = 30,
  areaName?: string,
  categoryQuery?: string
): Promise<Omit<Restaurant, 'curationScore'>[]> {
  // Use expanded search if we have category info, otherwise fall back to single query
  let items: NaverSearchLocalItem[];
  if (categoryQuery) {
    items = await searchLocalRestaurantsExpanded(areaName, categoryQuery);
  } else {
    const response = await searchLocalRestaurants({ query, display: 5, sort: 'comment' });
    items = response.items;
  }

  // Parse and sort by distance
  const restaurants = items
    .map(item => parseNaverSearchItem(item, lat, lng))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  // Enrich only top N restaurants (by distance) to save API calls
  const toEnrich = restaurants.slice(0, enrichLimit);
  const rest = restaurants.slice(enrichLimit);

  // Enrich with image + blog data via official Naver APIs (sequential to avoid rate limit)
  const enriched: Omit<Restaurant, 'curationScore'>[] = [];
  for (const r of toEnrich) {
    enriched.push(await enrichRestaurantData(r));
  }

  return [...enriched, ...rest];
}

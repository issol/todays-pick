import type { NaverPlaceDetail } from "./types";
import { NaverApiError } from "./search";

/**
 * Fetch restaurant detail from Naver Place.
 * This is a proxy function to be called from Edge Functions.
 */
export async function fetchPlaceDetail(
  placeId: string
): Promise<NaverPlaceDetail | null> {
  try {
    // Naver Place API endpoint
    const url = `https://map.naver.com/v5/api/sites/summary/${placeId}?lang=ko`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://map.naver.com/",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new NaverApiError(
        "PLACE_API_ERROR",
        `Naver Place API error: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      id: placeId,
      name: data.name || "",
      category: data.category || "",
      phone: data.phone || "",
      address: data.address || "",
      roadAddress: data.roadAddress || "",
      latitude: data.y || 0,
      longitude: data.x || 0,
      imageUrl: data.imageUrl || data.thumUrl || undefined,
      rating: data.visitorReviewScore || data.blogCafeReviewScore || 0,
      reviewCount: data.visitorReviewCount || 0,
      blogReviewCount: data.blogCafeReviewCount || 0,
      menuInfo: data.menuInfo || undefined,
      businessHours: data.businessHours || undefined,
      naverPlaceUrl: `https://map.naver.com/v5/entry/place/${placeId}`,
    };
  } catch (error) {
    if (error instanceof NaverApiError) throw error;
    throw new NaverApiError("PLACE_API_ERROR", `Failed to fetch place detail: ${error}`);
  }
}

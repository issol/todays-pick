/**
 * Dynamically load the Naver Maps JavaScript SDK.
 * Only loads on client-side and only once.
 */

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadNaverMapsSDK(): Promise<void> {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  if (!clientId) {
    return Promise.reject(new Error("NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID is not set"));
  }

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Naver Maps SDK can only be loaded on client-side"));
      return;
    }

    // Check if already loaded
    if (window.naver?.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;

    script.onload = () => {
      isLoaded = true;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Naver Maps SDK"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isNaverMapsLoaded(): boolean {
  return isLoaded;
}

/**
 * Reverse geocode coordinates to get a district/neighborhood name.
 * Uses Naver Maps SDK geocoder submodule.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  await loadNaverMapsSDK();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naver = (window as any).naver;
  if (!naver?.maps?.Service) return null;

  return new Promise((resolve) => {
    naver.maps.Service.reverseGeocode(
      {
        coords: new naver.maps.LatLng(lat, lng),
        orders: [naver.maps.Service.OrderType.ADMCODE].join(','),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (status: number, response: any) => {
        if (status !== 200 || !response?.v2?.results?.length) {
          resolve(null);
          return;
        }

        const result = response.v2.results[0];
        const region = result.region;
        // Build area name: 시/구/동 level
        const parts: string[] = [];
        if (region?.area1?.name) parts.push(region.area1.name); // 시/도
        if (region?.area2?.name) parts.push(region.area2.name); // 구/군
        if (region?.area3?.name) parts.push(region.area3.name); // 동/면/읍

        // Return 구 + 동 level (e.g., "금천구 시흥동")
        resolve(parts.slice(1).join(' ') || parts[0] || null);
      }
    );
  });
}

/**
 * Forward geocode an address/place query to get coordinates.
 * Uses Naver Maps SDK geocoder submodule.
 */
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  await loadNaverMapsSDK();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naver = (window as any).naver;
  if (!naver?.maps?.Service) return null;

  return new Promise((resolve) => {
    naver.maps.Service.geocode(
      { query },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (status: number, response: any) => {
        if (status !== 200 || !response?.v2?.addresses?.length) {
          resolve(null);
          return;
        }

        const item = response.v2.addresses[0];
        resolve({
          lat: parseFloat(item.y),
          lng: parseFloat(item.x),
        });
      }
    );
  });
}

// Type augmentation for Naver Maps on window
declare global {
  interface Window {
    naver?: {
      maps?: unknown;
    };
  }
}

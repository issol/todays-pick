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

// Type augmentation for Naver Maps on window
declare global {
  interface Window {
    naver?: {
      maps?: unknown;
    };
  }
}

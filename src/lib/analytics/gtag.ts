export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Track page view
export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

// Track custom event
export function event(action: string, params?: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag("event", action, params);
}

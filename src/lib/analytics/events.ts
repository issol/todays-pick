import { event } from "./gtag";

export function trackPickRestaurant(restaurantName: string, category: string) {
  event("pick_restaurant", {
    restaurant_name: restaurantName,
    category: category,
  });
}

export function trackRetryPick(retryCount: number) {
  event("retry_pick", {
    retry_count: retryCount,
  });
}

export function trackNavigateToRestaurant(restaurantName: string) {
  event("navigate_to_restaurant", {
    restaurant_name: restaurantName,
  });
}

export function trackCallRestaurant(restaurantName: string) {
  event("call_restaurant", {
    restaurant_name: restaurantName,
  });
}

export function trackViewDetail(restaurantName: string) {
  event("view_detail", {
    restaurant_name: restaurantName,
  });
}

export function trackChangeLocation(lat: number, lng: number) {
  event("change_location", {
    latitude: lat,
    longitude: lng,
  });
}

export function trackChangeRadius(radius: number) {
  event("change_radius", {
    radius_meters: radius,
  });
}

export function trackChangeCategory(categories: string[]) {
  event("change_category", {
    categories: categories.join(","),
    category_count: categories.length,
  });
}

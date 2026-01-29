export interface CategoryDefinition {
  id: string;
  label: string;
  iconName: string;
  searchQuery: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: "korean", label: "한식", iconName: "UtensilsCrossed", searchQuery: "한식" },
  { id: "chinese", label: "중식", iconName: "Soup", searchQuery: "중식" },
  { id: "japanese", label: "일식", iconName: "Fish", searchQuery: "일식" },
  { id: "western", label: "양식", iconName: "Pizza", searchQuery: "양식" },
  { id: "snacks", label: "분식", iconName: "Cookie", searchQuery: "분식" },
  { id: "cafe", label: "카페", iconName: "Coffee", searchQuery: "카페 디저트" },
  { id: "fastfood", label: "패스트푸드", iconName: "Sandwich", searchQuery: "패스트푸드" },
  { id: "latenight", label: "야식", iconName: "Moon", searchQuery: "야식" },
];

export const RADIUS_OPTIONS = [
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
] as const;

export const DEFAULT_RADIUS = 500;

export const MAX_RETRIES = 3;

export const QUALITY_FILTER_DEFAULTS = {
  minRating: 4.0,
  minReviews: 50,
};

export const API_CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const GEOLOCATION_TIMEOUT = 5000; // 5 seconds

export const PRICE_RANGES = [
  { id: 'budget', label: '~1만원', symbol: '₩', minPrice: 0, maxPrice: 10000 },
  { id: 'mid', label: '1~2만원', symbol: '₩₩', minPrice: 10000, maxPrice: 20000 },
  { id: 'premium', label: '2만원~', symbol: '₩₩₩', minPrice: 20000, maxPrice: Infinity },
] as const;

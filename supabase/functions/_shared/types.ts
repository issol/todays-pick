// Naver Search API (Local) response types
export interface NaverSearchLocalResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchLocalItem[];
}

export interface NaverSearchLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

// Internal restaurant type
export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  reviewCount: number;
  blogReviewCount: number;
  imageUrl?: string;
  naverPlaceUrl: string;
  curationScore: number;
}

export interface PickResult {
  picked: Restaurant;
  alternatives: Restaurant[];
  timestamp: string;
}

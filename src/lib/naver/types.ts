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

// Naver Place detail types
export interface NaverPlaceDetail {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  blogReviewCount?: number;
  menuInfo?: string;
  businessHours?: string;
  naverPlaceUrl: string;
}

// Internal restaurant type (abstracted from Naver-specific types)
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
  menuInfo?: string;
  naverPlaceUrl: string;
  curationScore: number;
}

// Search request params
export interface NaverSearchParams {
  query: string;
  display?: number;
  start?: number;
  sort?: "random" | "comment";
}

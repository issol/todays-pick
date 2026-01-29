export interface Restaurant {
  id: string;
  name: string;
  category: string;
  phone?: string;
  address: string;
  roadAddress?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  blogReviewCount?: number;
  distance?: number;
  menuInfo?: string;
  businessHours?: string;
  naverPlaceUrl?: string;
  curationScore?: number;
}

export interface PickResult {
  picked: Restaurant;
  alternatives: Restaurant[];
  timestamp: string;
}

export interface LocationCoords {
  lat: number;
  lng: number;
}

export type CategoryType = '한식' | '중식' | '일식' | '양식' | '분식' | '카페' | '패스트푸드' | '야식';

import type { Restaurant } from "@/lib/naver/types";

export interface ScoredRestaurant extends Restaurant {
  curationScore: number;
}

export interface PickResult {
  picked: Restaurant;
  alternatives: Restaurant[];
}

export interface PickRequest {
  restaurants: Restaurant[];
  excludeIds?: string[];
}

export interface SearchRequest {
  latitude: number;
  longitude: number;
  radius: 500 | 1000 | 2000;
  categories?: string[];
  qualityFilter?: boolean;
}

export interface SearchResponse {
  restaurants: Restaurant[];
  total: number;
  filteredCount: number;
  suggestions?: {
    expandRadius?: boolean;
    relaxQualityFilter?: boolean;
    message: string;
  };
}

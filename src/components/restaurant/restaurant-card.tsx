'use client';

import type { Restaurant } from '@/lib/naver/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { BlacklistButton } from '@/components/blacklist/blacklist-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/cn';

// --- Shared utility functions (extracted from ResultCard) ---

export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  return text.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27|#x2F);/g, (match) => entities[match] || match);
}

export function getCurationScoreStyle(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: 'bg-green-100 text-green-800', text: '추천 점수' };
  if (score >= 50) return { bg: 'bg-yellow-100 text-yellow-800', text: '추천 점수' };
  return { bg: 'bg-gray-100 text-gray-800', text: '추천 점수' };
}

export function estimatePriceRange(category: string): string {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('한식') ||
      categoryLower.includes('분식') ||
      categoryLower.includes('패스트푸드')) {
    return '₩';
  }

  if (categoryLower.includes('양식')) {
    return '₩₩';
  }

  return '₩₩';
}

// --- Component ---

interface RestaurantCardProps {
  restaurant: Restaurant;
  /** Additional info displayed above the card content (date, retry, etc.) */
  topBadge?: React.ReactNode;
  /** Custom action area at bottom of card */
  actions?: React.ReactNode;
  /** Show default action bar (detail/favorite/blacklist). Default: false */
  showDefaultActions?: boolean;
}

export function RestaurantCard({
  restaurant,
  topBadge,
  actions,
  showDefaultActions = false,
}: RestaurantCardProps) {
  const decodedName = decodeHtmlEntities(restaurant.name);
  const displayAddress = restaurant.roadAddress || restaurant.address;
  const curationStyle = restaurant.curationScore > 0
    ? getCurationScoreStyle(restaurant.curationScore)
    : null;

  const handleDetail = () => {
    if (restaurant.naverPlaceUrl) {
      window.open(restaurant.naverPlaceUrl, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Restaurant Image */}
      <div className="relative w-full h-36 bg-gray-100">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={decodedName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            🍽️
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Top Badge */}
        {topBadge && <div className="mb-2">{topBadge}</div>}

        {/* Restaurant Name */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-lg font-bold truncate mb-1.5">{decodedName}</h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>{decodedName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Category Badges */}
        <div className="flex gap-1.5 mb-2">
          <Badge variant="outline" className="text-xs font-semibold">
            {estimatePriceRange(restaurant.category)}
          </Badge>
          <Badge variant="secondary">
            {restaurant.category}
          </Badge>
        </div>

        {/* Rating */}
        {restaurant.rating > 0 ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-3.5 h-3.5',
                    star <= Math.round(restaurant.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{restaurant.rating.toFixed(1)}</span>
            {restaurant.reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                ({restaurant.reviewCount.toLocaleString()}개 리뷰)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
            리뷰 정보 없음
          </div>
        )}

        {/* Address */}
        {displayAddress && (
          <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate cursor-default">{displayAddress}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{displayAddress}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Curation Score */}
        {curationStyle && (
          <div className="flex items-center gap-2">
            <Badge className={cn('font-semibold', curationStyle.bg)}>
              {curationStyle.text} {restaurant.curationScore}
            </Badge>
          </div>
        )}
      </CardContent>

      {/* Custom Actions */}
      {actions && (
        <div className="border-t border-border px-4 py-3">
          {actions}
        </div>
      )}

      {/* Default Action Bar */}
      {showDefaultActions && (
        <div className="border-t border-border bg-muted/30">
          <div className="grid grid-cols-3 divide-x divide-border">
            <button
              onClick={handleDetail}
              className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-accent/50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium">상세보기</span>
            </button>
            <div className="flex items-center justify-center py-3 hover:bg-accent/50 transition-colors">
              <FavoriteButton restaurant={restaurant} size="sm" bare label="즐겨찾기" />
            </div>
            <div className="flex items-center justify-center py-3 hover:bg-accent/50 transition-colors">
              <BlacklistButton restaurant={restaurant} bare label="차단" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

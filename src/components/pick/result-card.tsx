'use client';

import { Restaurant } from '@/lib/naver/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { BlacklistButton } from '@/components/blacklist/blacklist-button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface ResultCardProps {
  restaurant: Restaurant;
  userLocation?: { lat: number; lng: number } | null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(meters?: number): string {
  if (!meters) return '';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getCurationScoreStyle(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: 'bg-green-100 text-green-800', text: '추천 점수' };
  if (score >= 50) return { bg: 'bg-yellow-100 text-yellow-800', text: '추천 점수' };
  return { bg: 'bg-gray-100 text-gray-800', text: '추천 점수' };
}

function estimatePriceRange(category: string): string {
  const categoryLower = category.toLowerCase();

  // Budget categories
  if (categoryLower.includes('한식') ||
      categoryLower.includes('분식') ||
      categoryLower.includes('패스트푸드')) {
    return '₩';
  }

  // Premium categories
  if (categoryLower.includes('양식')) {
    return '₩₩'; // Can be mid to premium
  }

  // Mid-range categories (default)
  return '₩₩';
}

export function ResultCard({ restaurant, userLocation }: ResultCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        restaurant.latitude,
        restaurant.longitude
      )
    : restaurant.distance;

  const curationStyle = getCurationScoreStyle(restaurant.curationScore);

  const handleNavigate = () => {
    const naverMapUrl = `https://map.naver.com/v5/directions/-/-/-/transit?c=${restaurant.longitude},${restaurant.latitude},15,0,0,0,dh`;
    window.open(naverMapUrl, '_blank');
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const handleDetail = () => {
    window.open(restaurant.naverPlaceUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden shadow-lg">
        {/* Restaurant Image */}
        <div className="relative w-full h-48 bg-gray-100">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              🍽️
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Restaurant Name & Category */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-xl font-bold truncate flex-1">{restaurant.name}</h2>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="outline" className="text-xs font-semibold">
                {estimatePriceRange(restaurant.category)}
              </Badge>
              <Badge variant="secondary">
                {restaurant.category}
              </Badge>
            </div>
          </div>

          {/* Rating */}
          {restaurant.rating > 0 ? (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
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
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
              리뷰 정보 없음
            </div>
          )}

          {/* Distance */}
          {distance && (
            <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{formatDistance(distance)}</span>
            </div>
          )}

          {/* Address */}
          <p className="text-sm text-gray-600 mb-3 truncate">
            {restaurant.roadAddress || restaurant.address}
          </p>

          {/* Curation Score */}
          {restaurant.curationScore > 0 && (
            <div className="flex items-center gap-2">
              <Badge className={cn('font-semibold', curationStyle.bg)}>
                {curationStyle.text} {restaurant.curationScore}
              </Badge>
            </div>
          )}
        </CardContent>

        {/* Action Bar - Integrated Footer */}
        <div className="border-t border-border bg-muted/30">
          <div className="grid grid-cols-5 divide-x divide-border">
            {/* Navigate */}
            <button
              onClick={handleNavigate}
              className="flex flex-col items-center justify-center gap-1.5 py-4 hover:bg-accent/50 transition-colors"
            >
              <Navigation className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium">길찾기</span>
            </button>

            {/* Call */}
            <button
              onClick={handleCall}
              disabled={!restaurant.phone}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-4 transition-colors",
                restaurant.phone
                  ? "hover:bg-accent/50"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium">전화</span>
            </button>

            {/* Detail */}
            <button
              onClick={handleDetail}
              className="flex flex-col items-center justify-center gap-1.5 py-4 hover:bg-accent/50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium">상세보기</span>
            </button>

            {/* Favorite */}
            <div className="flex flex-col items-center justify-center gap-1.5 py-4 hover:bg-accent/50 transition-colors">
              <FavoriteButton restaurant={restaurant} size="sm" />
              <span className="text-xs font-medium">즐겨찾기</span>
            </div>

            {/* Blacklist */}
            <div className="flex flex-col items-center justify-center gap-1.5 py-4 hover:bg-accent/50 transition-colors">
              <BlacklistButton restaurant={restaurant} />
              <span className="text-xs font-medium">차단</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

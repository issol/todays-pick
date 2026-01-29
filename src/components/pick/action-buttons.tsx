'use client';

import { Restaurant } from '@/lib/naver/types';
import { Button } from '@/components/ui/button';
import { Navigation, Phone, ExternalLink } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { BlacklistButton } from '@/components/blacklist/blacklist-button';

interface ActionButtonsProps {
  restaurant: Restaurant;
}

export function ActionButtons({ restaurant }: ActionButtonsProps) {
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
    <div className="space-y-3">
      {/* Row 1: Original 3 buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Navigate Button */}
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleNavigate}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-sm">길찾기</span>
        </Button>

        {/* Call Button */}
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleCall}
          disabled={!restaurant.phone}
        >
          <Phone className="w-5 h-5" />
          <span className="text-sm">전화</span>
        </Button>

        {/* Detail Button */}
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleDetail}
        >
          <ExternalLink className="w-5 h-5" />
          <span className="text-sm">상세보기</span>
        </Button>
      </div>

      {/* Row 2: Favorite and Blacklist buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Favorite Button Wrapper */}
        <div className="flex items-center justify-center border border-border rounded-md py-3 px-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <FavoriteButton restaurant={restaurant} size="sm" />
            <span className="text-sm font-medium">즐겨찾기</span>
          </div>
        </div>

        {/* Blacklist Button Wrapper */}
        <div className="flex items-center justify-center border border-border rounded-md py-3 px-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <BlacklistButton restaurant={restaurant} />
            <span className="text-sm font-medium">차단</span>
          </div>
        </div>
      </div>
    </div>
  );
}

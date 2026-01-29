'use client';

import { useState } from 'react';
import { X, Star, TrendingUp } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import type { Restaurant } from '@/lib/naver/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type SortOption = 'newest' | 'rating';

export function FavoritesList() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0; // newest is already sorted by created_at desc from DB
  });

  const handleRemove = async (restaurantId: string) => {
    try {
      setRemovingId(restaurantId);
      await removeFavorite(restaurantId);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuickPick = (restaurant: Restaurant) => {
    // TODO: Integrate with pick system
    console.log('Quick pick:', restaurant);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-6xl mb-4">❤️</div>
        <p className="text-lg text-muted-foreground">
          즐겨찾기한 맛집이 없어요.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          마음에 드는 맛집을 ❤️ 해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex gap-2 justify-end">
        <Button
          variant={sortBy === 'newest' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('newest')}
        >
          최신순
        </Button>
        <Button
          variant={sortBy === 'rating' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('rating')}
        >
          평점순
        </Button>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-4">
        {sortedFavorites.map((restaurant) => (
          <Card key={restaurant.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {restaurant.category}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(restaurant.id)}
                  disabled={removingId === restaurant.id}
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Stats */}
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="font-medium">{restaurant.curationScore}</span>
                </div>
              </div>

              {/* Address */}
              <p className="text-xs text-muted-foreground line-clamp-1">
                {restaurant.roadAddress || restaurant.address}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickPick(restaurant)}
                >
                  이 맛집으로!
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <a
                    href={restaurant.naverPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    상세보기
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

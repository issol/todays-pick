'use client';

import { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import type { Restaurant } from '@/lib/naver/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlacklistButton } from '@/components/blacklist/blacklist-button';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';

type SortOption = 'newest' | 'rating';

function FavoriteSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-36 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-10 bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
      </CardContent>
    </Card>
  );
}

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
      toast.success('즐겨찾기에서 제거됨');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('삭제에 실패했습니다');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-end">
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          <FavoriteSkeleton />
          <FavoriteSkeleton />
          <FavoriteSkeleton />
        </div>
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
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            actions={
              <div className="grid grid-cols-3 divide-x divide-border -mx-4 -mb-3 border-t border-border mt-3">
                <a
                  href={restaurant.naverPlaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-accent/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">상세보기</span>
                </a>
                <div className="flex items-center justify-center py-3 hover:bg-accent/50 transition-colors">
                  <BlacklistButton restaurant={restaurant} bare label="차단" />
                </div>
                <button
                  onClick={() => handleRemove(restaurant.id)}
                  disabled={removingId === restaurant.id}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-accent/50 transition-colors text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-medium">삭제</span>
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

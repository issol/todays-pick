'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/use-favorites';
import { LoginPromptDialog } from '@/components/auth/login-prompt-dialog';
import type { Restaurant } from '@/lib/naver/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  restaurant: Restaurant;
  size?: 'sm' | 'md';
  bare?: boolean;
  label?: string;
}

export function FavoriteButton({ restaurant, size = 'md', bare = false, label }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const favorited = isFavorite(restaurant.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      setIsToggling(true);
      await toggleFavorite(restaurant);
    } catch (error: unknown) {
      // Server returns 401 if not authenticated — show login prompt
      if (error instanceof Error && error.message.includes('401')) {
        setShowLoginPrompt(true);
      } else {
        console.error('Failed to toggle favorite:', error);
      }
    } finally {
      setIsToggling(false);
    }
  };

  const iconSize = size === 'sm' ? 16 : 20;

  const iconElement = (
    <motion.div
      animate={{ scale: isToggling ? 0.8 : 1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {favorited ? (
        <Heart
          size={iconSize}
          className="fill-red-500 text-red-500"
        />
      ) : (
        <Heart
          size={iconSize}
          className="text-muted-foreground hover:text-red-500 transition-colors"
        />
      )}
    </motion.div>
  );

  return (
    <>
      {bare ? (
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={cn(
            "inline-flex items-center justify-center",
            label && "flex-col gap-1.5 w-full h-full"
          )}
        >
          {iconElement}
          {label && <span className="text-xs font-medium">{label}</span>}
        </button>
      ) : (
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'icon'}
          onClick={handleToggle}
          disabled={isToggling}
          className={cn(
            'relative',
            size === 'sm' && 'h-8 w-8'
          )}
        >
          {iconElement}
        </Button>
      )}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        message="즐겨찾기를 사용하려면 로그인이 필요합니다"
      />
    </>
  );
}

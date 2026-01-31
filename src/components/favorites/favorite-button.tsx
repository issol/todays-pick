'use client';

import { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
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

interface FlyAnimation {
  startX: number;
  startY: number;
}

export function FavoriteButton({ restaurant, size = 'md', bare = false, label }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [flyAnimation, setFlyAnimation] = useState<FlyAnimation | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const favorited = isFavorite(restaurant.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const wasNotFavorited = !favorited;

    try {
      setIsToggling(true);
      await toggleFavorite(restaurant);

      // Success feedback
      if (wasNotFavorited) {
        // Trigger fly animation
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setFlyAnimation({
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
          });
        }
        toast.success('즐겨찾기에 추가됨');
      } else {
        toast.success('즐겨찾기에서 제거됨');
      }
    } catch (error: unknown) {
      // Server returns 401 if not authenticated — show login prompt
      if (error instanceof Error && error.message.includes('401')) {
        setShowLoginPrompt(true);
      } else {
        console.error('Failed to toggle favorite:', error);
        toast.error('즐겨찾기 처리에 실패했습니다');
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
          ref={buttonRef}
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
          ref={buttonRef}
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

      {/* Flying heart animation */}
      {typeof window !== 'undefined' && flyAnimation && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{
              position: 'fixed',
              left: flyAnimation.startX,
              top: flyAnimation.startY,
              x: '-50%',
              y: '-50%',
              opacity: 1,
              scale: 1,
              zIndex: 9999,
            }}
            animate={{
              left: typeof window !== 'undefined' ? window.innerWidth - 120 : flyAnimation.startX,
              top: 28,
              opacity: [1, 1, 0],
              scale: [1, 0.5, 0.3],
            }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
            onAnimationComplete={() => setFlyAnimation(null)}
          >
            <Heart className="fill-red-500 text-red-500" size={24} />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Restaurant } from '@/lib/naver/types';
import { cn } from '@/lib/utils/cn';

interface SlotMachineProps {
  restaurant: Restaurant;
  candidates: Restaurant[];
  onComplete: () => void;
  isActive: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  korean: '🍚',
  chinese: '🥟',
  japanese: '🍣',
  western: '🍕',
  snacks: '🍜',
  cafe: '☕',
  fastfood: '🍔',
  latenight: '🌙',
};

function getCategoryIcon(category: string): string {
  const lowerCategory = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerCategory.includes(key)) {
      return icon;
    }
  }
  return '🍽️'; // Default icon
}

export function SlotMachine({
  restaurant,
  candidates,
  onComplete,
  isActive,
}: SlotMachineProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const y = useMotionValue(0);

  // Create a reel: repeat candidates multiple times, then end with the final restaurant
  const reelItems = useRef<Restaurant[]>([]);
  useEffect(() => {
    if (candidates.length > 0) {
      // Create a reel with 20 items (cycling through candidates) + final restaurant
      const reel: Restaurant[] = [];
      for (let i = 0; i < 20; i++) {
        reel.push(candidates[i % candidates.length]);
      }
      reel.push(restaurant); // Final item
      reelItems.current = reel;
    }
  }, [candidates, restaurant]);

  useEffect(() => {
    if (!isActive || reelItems.current.length === 0) return;

    if (prefersReducedMotion) {
      // Skip animation
      setShowResult(true);
      onComplete();
      return;
    }

    setIsAnimating(true);
    setShowResult(false);

    const itemHeight = 80; // Height of each item in pixels
    const totalItems = reelItems.current.length;
    const finalPosition = -(totalItems - 1) * itemHeight;

    // Animation sequence
    const controls = animate(y, finalPosition, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth deceleration
      onComplete: () => {
        setIsAnimating(false);
        setShowResult(true);
        setTimeout(onComplete, 300);
      },
    });

    return () => controls.stop();
  }, [isActive, onComplete, y, prefersReducedMotion]);

  if (!isActive && !showResult) return null;

  if (prefersReducedMotion || showResult) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-orange-400',
          'bg-gradient-to-br from-orange-50 to-white p-8',
          'shadow-lg shadow-orange-200'
        )}
        aria-live="polite"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(251, 146, 60, 0)',
              '0 0 0 8px rgba(251, 146, 60, 0.2)',
              '0 0 0 0 rgba(251, 146, 60, 0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
        />
        <div className="relative flex flex-col items-center gap-4">
          <span className="text-6xl" aria-hidden="true">
            {getCategoryIcon(restaurant.category)}
          </span>
          <h2 className="text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h2>
          <p className="text-sm text-gray-600">{restaurant.category}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 border-orange-300',
        'bg-gradient-to-br from-orange-50 to-white',
        'shadow-lg shadow-orange-200'
      )}
      style={{ height: '240px' }}
    >
      {/* Background pulse animation */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-orange-100 to-transparent"
      />

      {/* Viewport mask */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-20 w-full overflow-hidden">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-orange-50 to-transparent z-10" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10" />

          {/* Scrolling reel */}
          <motion.div
            style={{ y }}
            className="absolute w-full"
          >
            {reelItems.current.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                className="flex items-center justify-center gap-3 h-20"
                style={{
                  filter: isAnimating ? 'blur(2px)' : 'blur(0px)',
                }}
              >
                <span className="text-3xl" aria-hidden="true">
                  {getCategoryIcon(item.category)}
                </span>
                <span className="text-xl font-semibold text-gray-800">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Center indicator line */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-full h-0.5 bg-orange-400 opacity-30" />
      </div>
    </div>
  );
}

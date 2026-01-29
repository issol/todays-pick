'use client';

import {
  UtensilsCrossed,
  Soup,
  Fish,
  Pizza,
  Cookie,
  Coffee,
  Sandwich,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  UtensilsCrossed,
  Soup,
  Fish,
  Pizza,
  Cookie,
  Coffee,
  Sandwich,
  Moon,
} as const;

interface CategoryChipProps {
  category: string;
  iconName: string;
  selected: boolean;
  onToggle: () => void;
}

export function CategoryChip({ category, iconName, selected, onToggle }: CategoryChipProps) {
  const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];

  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200',
        'hover:scale-105 active:scale-95',
        selected
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {Icon && <Icon className="w-6 h-6" />}
      <span className="text-sm font-medium">{category}</span>
    </button>
  );
}

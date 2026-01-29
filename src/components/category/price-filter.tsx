'use client';

import { useAppStore } from '@/stores/app-store';
import { PRICE_RANGES } from '@/lib/utils/constants';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';

export function PriceFilter() {
  const { selectedPriceRanges, togglePriceRange } = useAppStore();

  return (
    <div className="space-y-3 py-2">
      <div className="space-y-0.5">
        <Label className="text-base font-medium">
          가격대 선택
        </Label>
        <p className="text-sm text-muted-foreground">
          원하는 가격대를 선택해주세요 (복수 선택 가능)
        </p>
      </div>

      <div className="flex gap-2">
        {PRICE_RANGES.map((range) => (
          <Toggle
            key={range.id}
            pressed={selectedPriceRanges.includes(range.id)}
            onPressedChange={() => togglePriceRange(range.id)}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-lg font-semibold">{range.symbol}</span>
            <span className="text-xs">{range.label}</span>
          </Toggle>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { QUALITY_FILTER_DEFAULTS } from '@/lib/utils/constants';

export function QualityFilter() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label htmlFor="quality-filter" className="text-base font-medium">
          맛집만 보기
        </Label>
        <p className="text-sm text-muted-foreground">
          평점 {QUALITY_FILTER_DEFAULTS.minRating.toFixed(1)}+, 리뷰 {QUALITY_FILTER_DEFAULTS.minReviews}+
        </p>
      </div>
      <Switch
        id="quality-filter"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}

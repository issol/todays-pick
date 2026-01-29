'use client';

import { useAppStore } from '@/stores/app-store';
import { RADIUS_OPTIONS } from '@/lib/utils/constants';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function RadiusSelector() {
  const { radius, setRadius } = useAppStore();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">검색 반경</label>
      <ToggleGroup
        type="single"
        value={radius.toString()}
        onValueChange={(value) => {
          if (value) {
            setRadius(Number(value));
          }
        }}
        className="justify-start"
      >
        {RADIUS_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value.toString()}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

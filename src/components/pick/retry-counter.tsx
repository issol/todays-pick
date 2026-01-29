'use client';

import { usePickStore } from '@/stores/pick-store';
import { MAX_RETRIES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

export function RetryCounter() {
  const { retryCount } = usePickStore();

  if (retryCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span>다시 뽑기 {retryCount}/{MAX_RETRIES}</span>
      <div className="flex gap-1">
        {Array.from({ length: MAX_RETRIES }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index < retryCount ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlacklist } from '@/hooks/use-blacklist';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function BlacklistList() {
  const { blacklist, isLoading, removeFromBlacklist } = useBlacklist();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (blacklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <ShieldOff className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          차단된 맛집이 없어요
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          원하지 않는 맛집을 차단하면 추천에서 제외됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b bg-muted/50">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{blacklist.length}</span>개
        </p>
      </div>

      <div className="divide-y">
        {blacklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-medium truncate">{item.restaurantName}</h3>
              {item.reason && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.reason}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromBlacklist(item.restaurantId)}
            >
              해제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

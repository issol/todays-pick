'use client';

import { SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <SearchX className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        이 지역에서 맛집을 찾지 못했어요
      </h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• 검색 반경을 넓혀보세요</p>
        <p>• 다른 카테고리를 선택해보세요</p>
        <p>• 맛집 필터를 해제해보세요</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHistory } from '@/hooks/use-history';
import { useAuth } from '@/hooks/use-auth';
import { HistoryItem } from './history-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export function HistoryList() {
  const { history, loading, error, hasMore, fetchHistory, deleteHistoryItem, totalCount } = useHistory();
  const { isAnonymous, signInWithGoogle } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchHistory(nextPage);
  };

  if (error) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">기록을 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading && history.length === 0) {
    return (
      <div className="space-y-3 px-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 mt-16">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            아직 픽 기록이 없어요.
          </p>
          <p className="text-sm text-muted-foreground">
            첫 번째 맛집을 뽑아보세요!
          </p>
          <Link href="/">
            <Button>홈으로 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      {/* Login banner for anonymous users */}
      {isAnonymous && (
        <Card className="mb-4 border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">
              로그인하면 기록이 영구 저장됩니다.
            </p>
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => signInWithGoogle()}>
              <LogIn className="h-4 w-4" />
              로그인
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Total count */}
      <div className="mb-4 text-sm text-muted-foreground">
        총 {totalCount}개의 기록
      </div>

      {/* History list */}
      <div className="space-y-3">
        {history.map(item => (
          <HistoryItem
            key={item.id}
            item={item}
            onDelete={deleteHistoryItem}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? '불러오는 중...' : '더 보기'}
          </Button>
        </div>
      )}
    </div>
  );
}

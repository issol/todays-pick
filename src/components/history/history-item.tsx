'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import type { Restaurant } from '@/lib/naver/types';
import type { Database } from '@/lib/supabase/types';

type PickHistoryRow = Database['public']['Tables']['picks_history']['Row'];

interface HistoryItemProps {
  item: PickHistoryRow;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const restaurant = item.restaurant_data as Restaurant | null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = format(new Date(item.picked_at), 'M월 d일 (EEE) HH:mm', {
    locale: ko,
  });

  if (!restaurant) {
    return null;
  }

  const topBadge = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">{formattedDate}</span>
      <div className="flex items-center gap-1">
        {item.was_accepted ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-600 font-medium">수락</span>
          </>
        ) : (
          <>
            <X className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs text-red-600 font-medium">건너뜀</span>
          </>
        )}
      </div>
      {item.retry_count > 0 && (
        <Badge variant="outline" className="text-xs">
          재시도 {item.retry_count}회
        </Badge>
      )}
    </div>
  );

  const actions = (
    <div className="flex items-center justify-between">
      <FavoriteButton restaurant={restaurant} size="sm" />
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        삭제
      </Button>
    </div>
  );

  return (
    <>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        className="relative"
      >
        <RestaurantCard
          restaurant={restaurant}
          topBadge={topBadge}
          actions={actions}
        />

        {/* Swipe indicator */}
        <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
          <Trash2 className="w-5 h-5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기록 삭제</DialogTitle>
            <DialogDescription>
              이 픽 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

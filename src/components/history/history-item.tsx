'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Database } from '@/lib/supabase/types';

type PickHistoryRow = Database['public']['Tables']['picks_history']['Row'];

interface HistoryItemProps {
  item: PickHistoryRow;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const restaurantData = item.restaurant_data as {
    name: string;
    category: string;
    rating: number;
  } | null;

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

  const rating = restaurantData?.rating || 0;

  return (
    <>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        className="relative"
      >
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base truncate">
                    {item.restaurant_name}
                  </h3>
                  {restaurantData?.category && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {restaurantData.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span>{formattedDate}</span>
                  {rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {item.was_accepted ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">수락</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">건너뜀</span>
                      </>
                    )}
                  </div>

                  {item.retry_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      재시도 {item.retry_count}회
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>

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

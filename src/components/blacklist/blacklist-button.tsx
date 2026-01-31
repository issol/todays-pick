'use client';

import { useState } from 'react';
import { Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBlacklist } from '@/hooks/use-blacklist';
import { useAuth } from '@/hooks/use-auth';
import { LoginPromptDialog } from '@/components/auth/login-prompt-dialog';
import type { Restaurant } from '@/lib/naver/types';

interface BlacklistButtonProps {
  restaurant: Restaurant;
  bare?: boolean;
  label?: string;
}

const REASON_PRESETS = [
  '맛없어요',
  '위생 문제',
  '영업 종료',
  '기타',
] as const;

export function BlacklistButton({ restaurant, bare = false, label }: BlacklistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAnonymous } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addToBlacklist, isBlacklisted } = useBlacklist();

  const handleAddToBlacklist = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addToBlacklist(restaurant, selectedReason || undefined);
      toast.success('차단 목록에 추가됨');
      setIsOpen(false);
      setSelectedReason('');
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      toast.error('차단 처리에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const alreadyBlacklisted = isBlacklisted(restaurant.id);

  const handleClick = () => {
    if (isAnonymous) {
      setShowLoginPrompt(true);
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {bare ? (
        <button
          onClick={handleClick}
          disabled={alreadyBlacklisted}
          className={`inline-flex items-center justify-center${label ? ' flex-col gap-1.5 w-full h-full' : ''}`}
          title={alreadyBlacklisted ? '이미 차단된 맛집' : '차단 목록에 추가'}
        >
          <Ban className="w-5 h-5 text-muted-foreground" />
          {label && <span className="text-xs font-medium">{label}</span>}
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={alreadyBlacklisted}
          title={alreadyBlacklisted ? '이미 차단된 맛집' : '차단 목록에 추가'}
        >
          <Ban className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>이 맛집을 왜 제외하나요?</DialogTitle>
            <DialogDescription>
              선택사항입니다. 이유를 선택하시거나 그냥 차단하셔도 됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            {REASON_PRESETS.map((reason) => (
              <Button
                key={reason}
                variant={selectedReason === reason ? 'default' : 'outline'}
                onClick={() => setSelectedReason(reason)}
                className="justify-start"
              >
                {reason}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedReason('');
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button onClick={handleAddToBlacklist} disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '차단하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        message="차단 목록을 사용하려면 로그인이 필요합니다"
      />
    </>
  );
}

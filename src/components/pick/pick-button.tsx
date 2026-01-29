'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { usePickStore } from '@/stores/pick-store';
import { MAX_RETRIES } from '@/lib/utils/constants';

interface PickButtonProps {
  onPick: () => void;
}

export function PickButton({ onPick }: PickButtonProps) {
  const { currentLocation, selectedCategories } = useAppStore();
  const { isSearching, isPicking, retryCount, currentPick } = usePickStore();

  const isLoading = isSearching || isPicking;
  const hasLocation = currentLocation !== null;
  const hasCategories = selectedCategories.length > 0;
  const hasReachedMaxRetries = retryCount >= MAX_RETRIES;
  const hasCurrentPick = currentPick !== null;

  const isDisabled =
    !hasLocation || !hasCategories || isLoading || hasReachedMaxRetries;

  const getButtonText = () => {
    if (hasReachedMaxRetries) {
      return '오늘은 여기까지!';
    }
    if (isLoading) {
      return isSearching ? '검색 중...' : '선택 중...';
    }
    if (hasCurrentPick && retryCount > 0) {
      return `다시 뽑기 (${retryCount}/${MAX_RETRIES})`;
    }
    return '오늘의 픽!';
  };

  return (
    <Button
      variant="default"
      size="lg"
      className="w-full"
      onClick={onPick}
      disabled={isDisabled}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles />
      )}
      {getButtonText()}
    </Button>
  );
}

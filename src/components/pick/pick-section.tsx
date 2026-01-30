'use client';

import { useState } from 'react';
import { useRandomPick } from '@/hooks/use-random-pick';
import { usePickStore } from '@/stores/pick-store';
import { useAppStore } from '@/stores/app-store';
import { PickButton } from './pick-button';
import { SlotMachine } from './slot-machine';
import { ResultCard } from './result-card';
import { EmptyState } from './empty-state';
import { RetryCounter } from './retry-counter';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, Loader2 } from 'lucide-react';
import { MAX_RETRIES } from '@/lib/utils/constants';
import { AnimatePresence, motion } from 'framer-motion';

export function PickSection() {
  const { searchAndPick, retryPick } = useRandomPick();
  const { currentPick, alternatives, retryCount, isSearching, isPicking, error, searchResults, reset } = usePickStore();
  const { currentLocation } = useAppStore();

  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const hasResult = currentPick !== null;
  const isLoading = isSearching || isPicking;
  const hasReachedMaxRetries = retryCount >= MAX_RETRIES;

  const handlePick = async () => {
    setShowResult(false);
    setShowSlotMachine(true);

    if (retryCount === 0 || searchResults.length === 0) {
      await searchAndPick();
    } else {
      await retryPick();
    }
  };

  const handleSlotComplete = () => {
    setShowSlotMachine(false);
    setShowResult(true);
  };

  const handleReset = () => {
    reset();
    setShowResult(false);
    setShowSlotMachine(false);
  };

  // Show empty state when search completed with no results
  const showEmpty = !isSearching && !isPicking && searchResults.length === 0 && retryCount === 0 && error === null && currentPick === null;

  return (
    <div className="space-y-6">
      {/* Pick Button - only show before first pick */}
      {!hasResult && !showSlotMachine && (
        <PickButton onPick={handlePick} />
      )}

      {/* Slot Machine Animation */}
      <AnimatePresence mode="wait">
        {showSlotMachine && currentPick && (
          <SlotMachine
            restaurant={currentPick}
            candidates={[...alternatives, currentPick]}
            onComplete={handleSlotComplete}
            isActive={true}
          />
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence mode="wait">
        {showResult && currentPick && !showSlotMachine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <ResultCard restaurant={currentPick} userLocation={currentLocation} />

            {retryCount > 0 && <RetryCounter />}

            {/* Retry / Reset Buttons */}
            <div className="space-y-3">
              {!hasReachedMaxRetries && (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={handlePick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isLoading
                    ? '선택 중...'
                    : `다시 뽑기 (${retryCount}/${MAX_RETRIES})`}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleReset}
                disabled={isLoading}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                처음으로
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {showEmpty && <EmptyState />}

      {/* Error */}
      {error && (
        <div className="text-center text-destructive py-4">
          {error}
        </div>
      )}
    </div>
  );
}

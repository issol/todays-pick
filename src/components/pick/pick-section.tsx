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

function PickLoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-muted-foreground"
      >
        맛집을 찾고 있어요...
      </motion.p>
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function PickSection() {
  const { searchAndPick, retryPick } = useRandomPick();
  const {
    currentPick, alternatives, retryCount,
    isSearching, isPicking, error, searchResults,
    hasSearched, reset,
  } = usePickStore();
  const { currentLocation } = useAppStore();

  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const hasResult = currentPick !== null;
  const isLoading = isSearching || isPicking;
  const hasReachedMaxRetries = retryCount >= MAX_RETRIES;
  const isEmpty = hasSearched && !isLoading && searchResults.length === 0 && !hasResult;

  const handlePick = async () => {
    setShowResult(false);
    setShowSlotMachine(false);

    if (!hasResult || searchResults.length === 0) {
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

  // After search completes with results and we have a pick, show slot machine
  // We need to detect when currentPick becomes available after loading
  const shouldShowSlot = isLoading === false && currentPick !== null && !showResult && !showSlotMachine && hasSearched;
  if (shouldShowSlot && !showSlotMachine && !showResult) {
    // Auto-trigger slot machine when pick is ready
    setShowSlotMachine(true);
  }

  return (
    <div className="space-y-6">
      {/* Pick Button - only show before first pick */}
      {!hasResult && !isLoading && !hasSearched && (
        <PickButton onPick={handlePick} />
      )}

      {/* Loading Animation */}
      <AnimatePresence mode="wait">
        {isLoading && !showSlotMachine && (
          <PickLoadingAnimation />
        )}
      </AnimatePresence>

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

      {/* Empty State - shown in result flow */}
      <AnimatePresence mode="wait">
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <EmptyState />

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleReset}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              처음으로
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error (non-empty related) */}
      {error && !isEmpty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-destructive py-4"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}

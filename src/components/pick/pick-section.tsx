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
import { AnimatePresence, motion } from 'framer-motion';

export function PickSection() {
  const { searchAndPick, retryPick } = useRandomPick();
  const { currentPick, alternatives, retryCount, isSearching, isPicking, error, searchResults } = usePickStore();
  const { currentLocation } = useAppStore();

  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  // Show empty state when search completed with no results
  const showEmpty = !isSearching && !isPicking && searchResults.length === 0 && retryCount === 0 && error === null && currentPick === null;

  return (
    <div className="space-y-6">
      {/* Pick Button */}
      <PickButton onPick={handlePick} />

      {retryCount > 0 && <RetryCounter />}

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
          <ResultCard restaurant={currentPick} userLocation={currentLocation} />
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

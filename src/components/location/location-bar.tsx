'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationModal } from './location-modal';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn } from '@/lib/utils';

export function LocationBar() {
  const [modalOpen, setModalOpen] = useState(false);
  const { currentLocation, isLocating, locationAddress } = useAppStore();
  const { requestLocation } = useGeolocation();
  const hasAutoDetected = useRef(false);

  // Auto-detect GPS on first page load
  useEffect(() => {
    if (!currentLocation && !hasAutoDetected.current) {
      hasAutoDetected.current = true;
      requestLocation().catch(() => {
        // Silent — user can set location manually via modal
      });
    }
  }, [currentLocation, requestLocation]);

  const displayAddress = locationAddress
    || (currentLocation
      ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
      : null);

  const truncateAddress = (address: string, maxLength: number = 30) => {
    if (address.length <= maxLength) return address;
    return address.slice(0, maxLength) + '...';
  };

  if (isLocating) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <Skeleton className="h-5 flex-1" />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-between h-auto p-4 border rounded-lg",
          !displayAddress && "text-muted-foreground"
        )}
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          <span className="truncate text-left">
            {displayAddress
              ? truncateAddress(displayAddress)
              : '위치를 설정해주세요'}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 ml-2" />
      </Button>

      <LocationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

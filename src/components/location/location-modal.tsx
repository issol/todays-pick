'use client';

import { useState } from 'react';
import { Search, Navigation } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/use-geolocation';
import { RadiusSelector } from './radius-selector';
import { NaverMap } from './naver-map';
import { useAppStore } from '@/stores/app-store';
import { geocodeAddress, reverseGeocode } from '@/lib/naver/maps';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { requestLocation, isLoading, error } = useGeolocation();
  const { locationError, setLocation, setLocationAddress } = useAppStore();

  const handleCurrentLocation = async () => {
    try {
      await requestLocation();
      onOpenChange(false);
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to get current location:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await geocodeAddress(searchQuery.trim());
      if (result) {
        setLocation(result);
        // Reverse geocode to get display address
        const address = await reverseGeocode(result.lat, result.lng);
        if (address) {
          setLocationAddress(address);
        }
      } else {
        setSearchError('검색 결과를 찾을 수 없습니다');
      }
    } catch {
      setSearchError('주소 검색 중 오류가 발생했습니다');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>위치 설정</SheetTitle>
          <SheetDescription>
            주소를 검색하거나 현재 위치를 사용하세요
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="주소 또는 장소 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10"
              disabled={isSearching}
            />
          </div>

          {/* Current Location Button */}
          <Button
            onClick={handleCurrentLocation}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Navigation className="mr-2 h-4 w-4" />
            {isLoading ? '위치 가져오는 중...' : '현재 위치 사용'}
          </Button>

          {/* Error Display */}
          {(error || locationError || searchError) && (
            <div className="text-sm text-destructive">
              {error || locationError || searchError}
            </div>
          )}

          {/* Radius Selector */}
          <div className="pt-4">
            <RadiusSelector />
          </div>

          {/* Map Preview */}
          <NaverMap className="mt-6" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

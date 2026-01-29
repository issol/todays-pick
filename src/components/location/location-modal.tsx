'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Navigation, Loader2 } from 'lucide-react';
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
import { searchAddress, reverseGeocode, type GeocodedAddress } from '@/lib/naver/maps';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { requestLocation, isLoading, error } = useGeolocation();
  const { currentLocation, locationError, setLocation, setLocationAddress } = useAppStore();

  // Auto-detect location when modal opens and no location is set
  useEffect(() => {
    if (open && !currentLocation) {
      requestLocation().catch(() => {
        // Silent — user can manually set location
      });
    }
  }, [open, currentLocation, requestLocation]);

  // Debounced address search for autocomplete suggestions
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  const selectAddress = useCallback(async (addr: GeocodedAddress) => {
    setLocation({ lat: addr.lat, lng: addr.lng });
    const displayAddr = addr.roadAddress || addr.jibunAddress;
    setLocationAddress(displayAddr);
    setSearchQuery(displayAddr);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [setLocation, setLocationAddress]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);

    try {
      const results = await searchAddress(searchQuery.trim());
      if (results.length > 0) {
        await selectAddress(results[0]);
      } else {
        setSearchError('검색 결과를 찾을 수 없습니다. 도로명이나 지번 주소를 입력해주세요.');
      }
    } catch {
      setSearchError('주소 검색 중 오류가 발생했습니다');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      await requestLocation();
    } catch (err) {
      console.error('Failed to get current location:', err);
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
          {/* Search Input with Autocomplete */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="도로명, 지번, 건물명으로 검색"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="pl-10 pr-10"
              disabled={isSearching}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {/* Address Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectAddress(addr);
                    }}
                  >
                    <div className="font-medium">
                      {addr.roadAddress || addr.jibunAddress}
                    </div>
                    {addr.roadAddress && addr.jibunAddress && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        (지번) {addr.jibunAddress}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
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

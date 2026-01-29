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
import { searchAddress, searchPlace, reverseGeocode, type GeocodedAddress, type PlaceSearchResult } from '@/lib/naver/maps';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  type Suggestion = {
    type: 'address';
    data: GeocodedAddress;
  } | {
    type: 'place';
    data: PlaceSearchResult;
  };

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { requestLocation, isLoading, error } = useGeolocation();
  const { currentLocation, locationError, setLocation, setLocationAddress } = useAppStore();

  // Auto-detect location only once when modal first opens with no location
  const hasAutoDetectedRef = useRef(false);
  useEffect(() => {
    if (open && !currentLocation && !hasAutoDetectedRef.current) {
      hasAutoDetectedRef.current = true;
      requestLocation().catch(() => {
        // Silent — user can manually set location
      });
    }
    if (!open) {
      hasAutoDetectedRef.current = false;
    }
  }, [open, currentLocation, requestLocation]);

  // Debounced combined search for autocomplete suggestions
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
        // Search both address geocode and place name in parallel
        const [addrResults, placeResults] = await Promise.all([
          searchAddress(value.trim()),
          searchPlace(value.trim()),
        ]);

        const combined: Suggestion[] = [
          ...addrResults.map((a): Suggestion => ({ type: 'address', data: a })),
          ...placeResults.map((p): Suggestion => ({ type: 'place', data: p })),
        ];

        setSuggestions(combined);
        setShowSuggestions(combined.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  const selectSuggestion = useCallback(async (item: Suggestion) => {
    const lat = item.type === 'address' ? item.data.lat : item.data.lat;
    const lng = item.type === 'address' ? item.data.lng : item.data.lng;
    setLocation({ lat, lng });

    let displayAddr: string;
    if (item.type === 'address') {
      displayAddr = item.data.roadAddress || item.data.jibunAddress;
    } else {
      displayAddr = item.data.name + (item.data.roadAddress ? ` (${item.data.roadAddress})` : '');
    }

    // Also get short area name for the location bar
    const areaName = await reverseGeocode(lat, lng);
    setLocationAddress(areaName || displayAddr);
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
      // Try address geocode first, then place name search
      const [addrResults, placeResults] = await Promise.all([
        searchAddress(searchQuery.trim()),
        searchPlace(searchQuery.trim()),
      ]);

      if (addrResults.length > 0) {
        await selectSuggestion({ type: 'address', data: addrResults[0] });
      } else if (placeResults.length > 0) {
        await selectSuggestion({ type: 'place', data: placeResults[0] });
      } else {
        setSearchError('검색 결과를 찾을 수 없습니다');
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

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(item);
                    }}
                  >
                    {item.type === 'address' ? (
                      <>
                        <div className="font-medium">
                          {item.data.roadAddress || item.data.jibunAddress}
                        </div>
                        {item.data.roadAddress && item.data.jibunAddress && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            (지번) {item.data.jibunAddress}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-medium">{item.data.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.data.roadAddress || item.data.jibunAddress}
                          {item.data.category && (
                            <span className="ml-1 text-muted-foreground/60">· {item.data.category}</span>
                          )}
                        </div>
                      </>
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

'use client';

import { useEffect, useRef, useState } from 'react';
import { loadNaverMapsSDK } from '@/lib/naver/maps';
import { useAppStore } from '@/stores/app-store';
import { Skeleton } from '@/components/ui/skeleton';

interface NaverMapProps {
  className?: string;
}

export function NaverMap({ className }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLocation, radius } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        await loadNaverMapsSDK();
        if (cancelled || !mapRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const naver = (window as any).naver;
        const center = currentLocation
          ? new naver.maps.LatLng(currentLocation.lat, currentLocation.lng)
          : new naver.maps.LatLng(37.5665, 126.978); // Default: Seoul City Hall

        // Create map
        const map = new naver.maps.Map(mapRef.current, {
          center,
          zoom: getZoomForRadius(radius),
          zoomControl: true,
          zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT,
            style: naver.maps.ZoomControlStyle.SMALL,
          },
          mapTypeControl: false,
        });

        mapInstanceRef.current = map;

        // Add marker
        const marker = new naver.maps.Marker({
          position: center,
          map,
          icon: {
            content: '<div style="width:16px;height:16px;background:#FF6B35;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
            anchor: new naver.maps.Point(8, 8),
          },
        });
        markerRef.current = marker;

        // Add radius circle
        const circle = new naver.maps.Circle({
          map,
          center,
          radius: radius,
          fillColor: '#FF6B35',
          fillOpacity: 0.1,
          strokeColor: '#FF6B35',
          strokeOpacity: 0.5,
          strokeWeight: 2,
        });
        circleRef.current = circle;

        setIsLoading(false);
      } catch (_err) {
        if (!cancelled) {
          setError('지도를 불러올 수 없습니다');
          setIsLoading(false);
        }
      }
    }

    initMap();
    return () => { cancelled = true; };
  }, []); // Initialize once

  // Update position when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const naver = (window as any).naver;
    const newCenter = new naver.maps.LatLng(currentLocation.lat, currentLocation.lng);

    mapInstanceRef.current.setCenter(newCenter);
    markerRef.current?.setPosition(newCenter);
    circleRef.current?.setCenter(newCenter);
  }, [currentLocation]);

  // Update radius circle when radius changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    circleRef.current?.setRadius(radius);
    mapInstanceRef.current.setZoom(getZoomForRadius(radius));
  }, [radius]);

  if (error) {
    return (
      <div className={`h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground ${className || ''}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className || ''}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      <div ref={mapRef} className="h-64 w-full" />
    </div>
  );
}

function getZoomForRadius(radius: number): number {
  if (radius <= 500) return 16;
  if (radius <= 1000) return 15;
  return 14;
}

'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { LocationCoords } from '@/types';
import { GEOLOCATION_TIMEOUT } from '@/lib/utils/constants';
import { reverseGeocode } from '@/lib/naver/maps';

interface GeolocationState {
  location: LocationCoords | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const { setLocation, setLocationError, setIsLocating, setLocationAddress } = useAppStore();

  const requestLocation = useCallback(async (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'GPS를 지원하지 않는 브라우저입니다';
        setState({ location: null, error, isLoading: false });
        setLocationError(error);
        setIsLocating(false);
        reject(new Error(error));
        return;
      }

      // Prevent concurrent GPS requests
      if (state.isLoading) {
        reject(new Error('GPS 요청이 이미 진행 중입니다'));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      setIsLocating(true);
      setLocationError(null);

      const timeoutId = setTimeout(() => {
        const error = 'GPS 응답 시간이 초과되었습니다';
        setState({ location: null, error, isLoading: false });
        setLocationError(error);
        setIsLocating(false);
        reject(new Error(error));
      }, GEOLOCATION_TIMEOUT);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const coords: LocationCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({ location: coords, error: null, isLoading: false });
          setLocation(coords);
          setIsLocating(false);

          // Reverse geocode in background (don't block resolve)
          reverseGeocode(coords.lat, coords.lng).then((address) => {
            if (address) {
              setLocationAddress(address);
            }
          }).catch(() => {
            // Silently ignore reverse geocode errors
          });

          resolve(coords);
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다';
              break;
            case error.TIMEOUT:
              errorMessage = 'GPS 응답 시간이 초과되었습니다';
              break;
            default:
              errorMessage = '위치를 가져오는 중 오류가 발생했습니다';
          }

          setState({ location: null, error: errorMessage, isLoading: false });
          setLocationError(errorMessage);
          setIsLocating(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: GEOLOCATION_TIMEOUT,
          maximumAge: 0,
        }
      );
    });
  }, [setLocation, setLocationError, setIsLocating, setLocationAddress]);

  return {
    location: state.location,
    error: state.error,
    isLoading: state.isLoading,
    requestLocation,
  };
}

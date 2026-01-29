import { create } from 'zustand';
import { DEFAULT_RADIUS } from '@/lib/utils/constants';

interface AppState {
  // Location
  currentLocation: { lat: number; lng: number } | null;
  locationError: string | null;
  isLocating: boolean;
  locationAddress: string | null;

  // Category
  selectedCategories: string[];

  // Price Ranges
  selectedPriceRanges: string[];

  // Radius
  radius: number;

  // Pick state
  isPickInProgress: boolean;

  // Actions
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  setLocationError: (error: string | null) => void;
  setIsLocating: (v: boolean) => void;
  setLocationAddress: (address: string | null) => void;
  toggleCategory: (cat: string) => void;
  setCategories: (cats: string[]) => void;
  togglePriceRange: (range: string) => void;
  setPriceRanges: (ranges: string[]) => void;
  setRadius: (r: number) => void;
  setPickInProgress: (v: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentLocation: null,
  locationError: null,
  isLocating: false,
  locationAddress: null,
  selectedCategories: [],
  selectedPriceRanges: [],
  radius: DEFAULT_RADIUS,
  isPickInProgress: false,

  // Actions
  setLocation: (loc) => set({ currentLocation: loc, locationError: null, locationAddress: null }),
  setLocationError: (error) => set({ locationError: error }),
  setIsLocating: (v) => set({ isLocating: v }),
  setLocationAddress: (address) => set({ locationAddress: address }),
  toggleCategory: (cat) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(cat)
        ? state.selectedCategories.filter((c) => c !== cat)
        : [...state.selectedCategories, cat],
    })),
  setCategories: (cats) => set({ selectedCategories: cats }),
  togglePriceRange: (range) =>
    set((state) => ({
      selectedPriceRanges: state.selectedPriceRanges.includes(range)
        ? state.selectedPriceRanges.filter((r) => r !== range)
        : [...state.selectedPriceRanges, range],
    })),
  setPriceRanges: (ranges) => set({ selectedPriceRanges: ranges }),
  setRadius: (r) => set({ radius: r }),
  setPickInProgress: (v) => set({ isPickInProgress: v }),
  reset: () =>
    set({
      currentLocation: null,
      locationError: null,
      isLocating: false,
      locationAddress: null,
      selectedCategories: [],
      selectedPriceRanges: [],
      radius: DEFAULT_RADIUS,
      isPickInProgress: false,
    }),
}));

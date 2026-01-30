import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
}

// Canonical anonymous-checking logic — single source of truth
function computeIsAnonymous(user: User | null, profile: UserProfile | null): boolean {
  if (!user) return true;
  const hasRealIdentity = user.identities?.some(
    (i) => i.provider !== 'anonymous'
  ) ?? false;
  if (hasRealIdentity) return false;
  return user.is_anonymous ?? profile?.is_anonymous ?? true;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnonymous: boolean;
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAnonymous: true,
  setUser: (user) => {
    const profile = get().profile;
    set({ user, isAnonymous: computeIsAnonymous(user, profile) });
  },
  setProfile: (profile) => {
    const user = get().user;
    set({ profile, isAnonymous: computeIsAnonymous(user, profile) });
  },
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, profile: null, isAnonymous: true }),
}));

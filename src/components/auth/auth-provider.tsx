'use client';

import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { UserProfile } from '@/stores/auth-store';

// Extract profile from user.user_metadata (Google OAuth data) as fallback
function profileFromMetadata(user: User): UserProfile {
  const meta = user.user_metadata ?? {};
  return {
    email: user.email ?? meta.email ?? null,
    display_name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    is_anonymous: user.is_anonymous ?? false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async (user: User) => {
      // First, set profile from auth metadata immediately (no network wait)
      setProfile(profileFromMetadata(user));

      // Then try to get richer profile from DB (may have extra fields)
      try {
        const { data } = await supabase
          .from('users')
          .select('email, display_name, avatar_url, is_anonymous')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      } catch {
        // DB profile fetch failed — metadata fallback already set
      }
    };

    // Auth Timing Gap (documented, not a bug):
    // After OAuth redirect, there is a brief window (~<100ms) where
    // isAnonymous is still true while this init() call resolves.
    // This is acceptable because:
    // 1. loading=true during this window, so UI can gate interactions
    // 2. onAuthStateChange fires SIGNED_IN immediately when session detected
    // 3. The window is too short for user interaction (they must navigate,
    //    select categories, and click pick — all before getUser() resolves)

    // Initial session load — use getUser() for server-validated session
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) await fetchProfile(user);
      } catch {
        // Auth failed — continue without user
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Single auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip token refresh — user/profile haven't changed
        if (event === 'TOKEN_REFRESHED') return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Ensure loading is false after any auth state change
        setLoading(false);

        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}

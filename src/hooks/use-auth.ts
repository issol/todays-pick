'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();

    // Always use signInWithOAuth — linkIdentity causes double redirect issues
    // Anonymous session data will be handled separately if needed
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Atomic clear — immediately reflects in all subscribers
      // onAuthStateChange will also fire, but clearAuth is idempotent
      useAuthStore.getState().clearAuth();
    }
    return { error };
  }, []);

  return {
    user,
    profile,
    loading,
    isAnonymous,
    signInWithGoogle,
    signOut,
  };
}

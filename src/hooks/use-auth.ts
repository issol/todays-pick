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
    try {
      // Clear UI immediately (optimistic) so header updates without waiting
      // for network requests to complete
      useAuthStore.getState().clearAuth();

      // Then clean up server and client sessions in background
      const supabase = createClient();
      await Promise.all([
        fetch('/api/auth/signout', { method: 'POST' }),
        supabase.auth.signOut(),
      ]);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign out failed') };
    }
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

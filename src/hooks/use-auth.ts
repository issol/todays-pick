'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize supabase client to ensure stable reference
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('email, display_name, avatar_url, is_anonymous')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data);
      }
    } catch {
      // Profile fetch failed — continue without profile
    }
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      try {
        // Use getSession first (reads from cookie/storage, no server call)
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch {
        // Auth call failed — continue without user
      } finally {
        setLoading(false);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    const isAnonymous = user?.is_anonymous ?? profile?.is_anonymous ?? true;

    if (isAnonymous && user) {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, [supabase, user, profile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  }, [supabase]);

  // Check if user has a real (non-anonymous) identity provider
  const hasRealIdentity = user?.identities?.some(
    (i) => i.provider !== 'anonymous'
  ) ?? false;
  const isAnonymous = !user || (!hasRealIdentity && (user.is_anonymous ?? profile?.is_anonymous ?? true));

  return {
    user,
    profile,
    loading,
    isAnonymous,
    signInWithGoogle,
    signOut,
  };
}

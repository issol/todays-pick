'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('users')
          .select('email, display_name, avatar_url, is_anonymous')
          .eq('id', userId)
          .single();
        if (data) setProfile(data);
      } catch {
        // Profile fetch failed — continue without profile
      }
    };

    // Initial session load
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await fetchProfile(currentUser.id);
      } catch {
        // Auth failed — continue without user
      } finally {
        setLoading(false);
      }
    };
    init();

    // Single auth state listener with event filtering
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip TOKEN_REFRESHED — user/profile haven't changed, no re-fetch needed
        if (event === 'TOKEN_REFRESHED') return;

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
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}

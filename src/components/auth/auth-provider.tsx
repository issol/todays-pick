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

    // Initial session load — use getUser() for server-validated session
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) await fetchProfile(user.id);
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

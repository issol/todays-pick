'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const next = url.searchParams.get('next') || '/';

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('[auth/callback] Error exchanging code:', error.message);
          window.location.href = `${next}?auth_error=1`;
          return;
        }
      }

      // Redirect — AuthProvider will reload session and update global state
      // NOTE: Full page reload causes brief loading flash (loading: true -> false).
      // This is inherent to OAuth redirect flow and is expected behavior.
      window.location.href = next;
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
}

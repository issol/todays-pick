'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      const code = new URL(window.location.href).searchParams.get('code');

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('[auth/callback] Error exchanging code:', error.message);
        }
      }

      // Full page reload to ensure middleware runs and cookies propagate
      window.location.href = '/';
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

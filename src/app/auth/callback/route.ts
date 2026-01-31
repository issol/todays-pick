import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/';

  // Security: prevent open redirect (including protocol-relative URLs like //evil.com)
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/';
  }

  if (code) {
    const cookieStore = await cookies();
    const { url, anonKey } = getSupabaseConfig();

    // Capture cookies set during exchangeCodeForSession so we can
    // explicitly forward them on the redirect response.
    // WHY: NextResponse.redirect() creates a NEW Response object.
    // cookieStore.set() writes to the current response context, but
    // those cookies do NOT transfer to the new redirect Response.
    // Without this, the browser never receives auth cookies after OAuth.
    let pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies = cookiesToSet;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component context — safe to ignore
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine redirect origin for production (Vercel uses x-forwarded-host)
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      let redirectBase = origin;

      if (!isLocalEnv && forwardedHost) {
        redirectBase = `https://${forwardedHost}`;
      }

      const response = NextResponse.redirect(new URL(next, redirectBase));

      // Copy captured auth cookies onto the redirect response
      for (const { name, value, options } of pendingCookies) {
        response.cookies.set(name, value, options);
      }

      return response;
    }

    console.error('[auth/callback] Error exchanging code:', error.message);
  }

  // Auth code exchange failed or no code provided
  return NextResponse.redirect(new URL('/auth/auth-code-error', origin));
}

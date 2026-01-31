import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();

    // Track cookies set during exchangeCodeForSession so we can
    // explicitly forward them on the redirect response.
    let pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // setAll called from Server Component — middleware handles refresh
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] Error exchanging code:', error.message);
      return NextResponse.redirect(new URL(`/?auth_error=1`, origin));
    }

    // Build redirect response and explicitly set auth cookies on it
    // to ensure they survive the redirect (NextResponse.redirect creates
    // a new response object that may not inherit cookieStore mutations).
    const response = NextResponse.redirect(new URL(next, origin));
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    return response;
  }

  return NextResponse.redirect(new URL('/', origin));
}

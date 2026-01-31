import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // OAuth Flow Protection:
  // 1. Stray ?code= params on non-callback routes are redirected to /auth/callback
  // 2. /auth/callback requests get early-return (no session manipulation)
  // 3. For all other routes: refresh expired tokens via getUser()
  // 4. Auto-create anonymous session ONLY for genuinely new visitors
  //    (no user AND no auth cookies, preventing overwrites of valid sessions)
  //
  // NOTE: Do NOT add a code-verifier cookie check here. The code-verifier
  // cookie is consumed by exchangeCodeForSession() in the callback route
  // and will not exist on any subsequent request reaching middleware.

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // If OAuth code arrives on a non-callback route, redirect to /auth/callback
    const code = request.nextUrl.searchParams.get('code');
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

    if (code && !isAuthCallback) {
      const callbackUrl = new URL('/auth/callback', request.url);
      callbackUrl.searchParams.set('code', code);
      const next = request.nextUrl.searchParams.get('next');
      if (next) callbackUrl.searchParams.set('next', next);
      return NextResponse.redirect(callbackUrl);
    }

    // Skip session handling during OAuth callback — let the route handler manage it
    if (isAuthCallback) {
      return supabaseResponse;
    }

    // Check if auth cookies exist (indicates a previous session)
    const hasAuthCookies = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.includes('auth-token')
    );

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser();

    // Auto-create anonymous session ONLY if no user AND no existing auth cookies
    // This prevents overwriting a valid session when getUser() temporarily fails
    if (!user && !hasAuthCookies) {
      await supabase.auth.signInAnonymously();
    }
  } catch {
    // Supabase auth call failed — continue without session
    // This prevents middleware crashes on cold starts or network issues
  }

  return supabaseResponse;
}

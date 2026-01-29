import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
    // Skip anonymous session creation for auth callback route
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser();

    // Auto-create anonymous session if no user (skip during OAuth callback)
    if (!user && !isAuthCallback) {
      await supabase.auth.signInAnonymously();
    }
  } catch {
    // Supabase auth call failed — continue without session
    // This prevents middleware crashes on cold starts or network issues
  }

  return supabaseResponse;
}

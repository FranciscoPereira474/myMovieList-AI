import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * * Handles GET requests by authenticating users and redirecting them accordingly.
 *  *
 *  * @param {Request} request - The incoming HTTP request.
 *  * @returns {NextResponse} A response object that redirects the user to a specific page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Exchange the auth code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // If we have a user, check their profile to see if a permanent username exists
      if (user && !userError) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, username_is_temp")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("[auth/callback] profile lookup error:", profileError);
        }

        // If profile indicates username is temporary or there is no username, send user to onboarding
        if ((profile && profile.username_is_temp) || !profile || !profile.username) {
          return NextResponse.redirect(`${origin}/onboarding/claim-username`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}

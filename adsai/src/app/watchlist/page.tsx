import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server-client";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * @param {object} None
 *  * @returns {JSX.Element | void}
 *  * Redirects the user to their watchlist page after authentication.
 */
export default async function WatchlistRoot() {
  const supabase = await createServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Not logged in -> render a prompt with a login link
      return (
        <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            type="no-data"
            title="Please log in"
            description={<>
              You must be logged in to view your watchlist. <Link href="/login" className="text-brand-500 underline">Log in</Link>.
            </>}
          />
        </main>
      );
    }

    // Try to resolve a username from profiles; fall back to user.id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile for watchlist redirect:", profileError);
    }

    const username = profile?.username || user.id;

    // Server-side redirect for immediate navigation
    return redirect(`/watchlist/${username}`);
  } catch (err: unknown) {
    // Next's redirect throws a special NEXT_REDIRECT error to short-circuit rendering.
    // Rethrow it so Next can handle the redirect normally.
    const error = err as { message?: string };
    if (error?.message === "NEXT_REDIRECT") throw err;

    console.error("Error resolving watchlist redirect:", err);
    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmptyState type="no-data" title="Error" description="Could not resolve your account. Please try logging in." />
      </main>
    );
  }
}

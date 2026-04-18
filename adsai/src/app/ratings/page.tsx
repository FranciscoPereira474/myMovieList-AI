import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server-client";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * * Renders the ratings root page, redirecting to the user's profile if logged in.
 *  *
 *  * @param {object} supabase - The Supabase server client instance.
 *  * @returns {JSX.Element | void}
 *  
 * export default async function RatingsRoot(supabase) {
 *   const { data: { user }, error: authError } = await supabase.auth.getUser();
 *
 *   if (authError || !user) {
 *     return (
 *       <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         <EmptyState
 *           type="no-data"
 *           title="Please log in"
 *           description={<>
 *             You must be logged in to view your ratings. <Link href="/login" className="text-brand-500 underline">Log in</Link>.
 *           </>}
 *         />
 *       </main>
 *     );
 *   }
 *
 *   const { data: profile, error: profileError } = await supabase
 *     .from("profiles")
 *     .select("username")
 *     .eq("id", user.id)
 *     .maybeSingle();
 *
 *   if (profileError) {
 *     console.error("Error fetching profile for ratings redirect:", profileError);
 *   }
 *
 *   const username = (profile as any)?.username || user.id;
 *
 *   return redirect(`/ratings/${username}`);
 * }
 */
export default async function RatingsRoot() {
  const supabase = await createServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return (
        <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            type="no-data"
            title="Please log in"
            description={<>
              You must be logged in to view your ratings. <Link href="/login" className="text-brand-500 underline">Log in</Link>.
            </>}
          />
        </main>
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile for ratings redirect:", profileError);
    }

    const username = profile?.username || user.id;

    return redirect(`/ratings/${username}`);
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (error?.message === "NEXT_REDIRECT") throw err;

    console.error("Error resolving ratings redirect:", err);
    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmptyState type="no-data" title="Error" description="Could not resolve your account. Please try logging in." />
      </main>
    );
  }
}

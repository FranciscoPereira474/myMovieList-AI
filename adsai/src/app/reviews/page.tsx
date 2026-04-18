import { createServerClient } from "@/lib/supabase/server-client";
import { getReviews } from "@/app/actions/reviews";
import { ReviewsFeed } from "./_components/ReviewsFeed";

interface ReviewsPageProps {
  searchParams?: Promise<{ sort?: string | string[] }>;
}

/**
 * Renders the Reviews page, displaying a feed of reviews for the current user.
 *
 * Accepts `searchParams` (may be a Promise in some Next versions) containing an
 * optional `sort` query param that will be used for initial server-side sorting.
 */
export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Map incoming sort param to allowed sort values
  const allowedSorts = ["popular", "recent", "most_liked", "most_disliked"] as const;
  type AllowedSort = typeof allowedSorts[number];
  // Normalize search param (may be string or string[]). `searchParams` can be a Promise in some Next versions.
  const sp = searchParams ? await searchParams : undefined;
  const rawSort = Array.isArray(sp?.sort) ? sp?.sort[0] : sp?.sort;
  const initialSort = rawSort && allowedSorts.includes(rawSort as AllowedSort) ? (rawSort as AllowedSort) : undefined;

  // Fetch initial reviews with server-side sort if provided
  const reviews = await getReviews(user?.id || null, initialSort ? { sortBy: initialSort } : {}, 0, 20);

  return (
    <div className="pt-24 pb-20 bg-neutral-950">
      <ReviewsFeed 
        initialReviews={reviews} 
        userId={user?.id || null}
        isLoggedIn={!!user}
        initialSort={initialSort}
      />
    </div>
  );
}

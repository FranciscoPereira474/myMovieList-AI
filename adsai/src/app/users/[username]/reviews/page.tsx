import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getUserProfile,
  getCurrentUser,
} from "../_lib/queries";
import { getReviews } from "@/app/actions/reviews";
import { ReviewsFeed } from "@/app/reviews/_components/ReviewsFeed";

interface UserReviewsPageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ sort?: string | string[] }>;
}

export default async function UserReviewsPage({ params, searchParams }: UserReviewsPageProps) {
  const { username } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const rawSort = Array.isArray(sp?.sort) ? sp?.sort[0] : sp?.sort;

  // Resolve profile by username. Support the special "me" slug.
  const currentUser = await getCurrentUser();
  let profile;
  if (username === "me") {
    if (!currentUser) return notFound();
    profile = await getUserProfile(currentUser.username);
  } else {
    profile = await getUserProfile(username);
  }

  if (!profile) return notFound();

  // Map incoming sort param to allowed sort values
  const allowedSorts = ["popular", "recent", "most_liked", "most_disliked"] as const;
  type AllowedSort = typeof allowedSorts[number];
  const initialSort = rawSort && allowedSorts.includes(rawSort as AllowedSort) ? (rawSort as AllowedSort) : undefined;

  // Fetch initial reviews for this user (apply initial sort on server when provided)
  const reviews = await getReviews(currentUser?.id ?? null, initialSort ? { sortBy: initialSort } : {}, 0, 20, profile.id);

  // Also fetch total review count for the author so we can show a clearer empty state
  const { getUserReviewsCount } = await import("../_lib/queries");
  const authorTotalReviews = await getUserReviewsCount(profile.id);

  return (
    <main className="pt-24 pb-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-neutral-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Reviews by {" "}
              <Link href={`/users/${profile.username}`} className="text-white hover:text-brand-400 transition-colors">
                @{profile.username}
              </Link>
            </h1>
            <p className="text-neutral-400 text-sm mt-1">All reviews written by this user.</p>
          </div>
        </div>
      </div>

      <ReviewsFeed
        initialReviews={reviews}
        userId={currentUser?.id ?? null}
        isLoggedIn={!!currentUser}
        authorId={profile.id}
        hideHeader
        authorTotalReviews={authorTotalReviews}
        initialSort={initialSort}
      />
    </main>
  );
}

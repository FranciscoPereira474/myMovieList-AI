import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoviesFilterSidebar,
  MoviesGrid,
  MoviesPagination,
  MobileFilters,
} from "@/app/movies/_components";
import { getRatingsPageData, resolveUserIdFromParam } from "../_lib/queries";
import type { SortOption } from "../_lib/queries";

export const metadata: Metadata = {
  title: "Ratings",
  description: "User ratings",
};

const ITEMS_PER_PAGE = 20;

interface RatingsPageProps {
  params: { username: string };
  searchParams: Record<string, string | undefined>;
}

/**
 * * Renders the UserRatingsPage component, displaying a list of movies rated by a specific user.
 *  *
 *  * @param {Object} props - Component props
 *  * @param {Object} props.params - URL parameters (username)
 *  * @param {Object} props.searchParams - Search query parameters
 *  * @returns {JSX.Element} The rendered UserRatingsPage component
 *  
 *
 * export default async function UserRatingsPage({ params, searchParams }: RatingsPageProps) {
 *   // ... rest of the code ...
 * }
 */
export default async function UserRatingsPage({ params, searchParams }: RatingsPageProps) {
  try {
    const resolvedParams = await Promise.resolve(params || {});
    const username = resolvedParams?.username;
    if (!username) {
      console.error("UserRatingsPage: missing params.username", { params: resolvedParams });
      return (
        <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState type="no-data" title="Invalid URL" description="Missing username parameter." />
        </main>
      );
    }

    const resolvedUserId = await resolveUserIdFromParam(username);

    if (!resolvedUserId) {
      // Render the folder-level not-found page for ratings
      notFound();
    }

    const paramsObj = await Promise.resolve(searchParams || {});
    const page = Number(paramsObj.page) || 1;
    const genres = paramsObj.genres?.split(",").map(Number).filter(Boolean) || [];
    const yearMin = paramsObj.yearMin ? Number(paramsObj.yearMin) : undefined;
    const yearMax = paramsObj.yearMax ? Number(paramsObj.yearMax) : undefined;
    const rawSort = paramsObj.sortBy;
    const allowedSorts = [
      "popularity.desc",
      "rating.desc",
      "release_date.desc",
      "release_date.asc",
      "title.asc",
      "title.desc",
    ] as SortOption[];
    const sortBy: SortOption = allowedSorts.includes(rawSort as SortOption)
      ? (rawSort as SortOption)
      : "popularity.desc";
    const search = paramsObj.q || undefined;

    const { movies, totalCount, genres: allGenres, yearRange } = await getRatingsPageData(resolvedUserId, {
      page,
      limit: ITEMS_PER_PAGE,
      genres,
      yearMin,
      yearMax,
      sortBy,
      search,
    });

    const hasActiveFilters = genres.length > 0 || yearMin || yearMax || sortBy !== "popularity.desc" || search;

    const pageTitle = `${username}'s Ratings`;

    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{pageTitle}</h1>
            <p className="text-neutral-400 text-sm mt-1">Found {totalCount.toLocaleString()} results</p>
          </div>
        </div>

        <Suspense fallback={null}>
            <MobileFilters basePath={`/ratings/${username}`} genres={allGenres} yearRange={yearRange} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Suspense
            fallback={
              <aside className="hidden lg:block space-y-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
              </aside>
            }
          >
            <MoviesFilterSidebar genres={allGenres} yearRange={yearRange} className="hidden lg:block" basePath={`/ratings/${username}`} />
          </Suspense>

          <div className="lg:col-span-3">
            {movies.length === 0 ? (
              <EmptyState
                type={hasActiveFilters ? "no-results" : "no-data"}
                title={hasActiveFilters ? "No movies found" : "No ratings yet"}
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters to find more movies."
                    : "This user has not rated any movies yet."
                }
              />
            ) : (
              <>
                <MoviesGrid movies={movies} />

                <div className="mt-16 flex justify-center">
                  <Suspense fallback={null}>
                    <MoviesPagination totalCount={totalCount} itemsPerPage={ITEMS_PER_PAGE} basePath={`/ratings/${username}`} />
                  </Suspense>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    );
  } catch (err: unknown) {
    // Rethrow Next.js internal control-flow errors so the framework can
    // handle them (redirects, notFound, etc.) instead of our generic
    // error UI swallowing them and showing an error fallback.
    const error = err as { message?: string };
    if (error?.message === "NEXT_REDIRECT") throw err;
    if (typeof error?.message === "string" && error.message.startsWith("NEXT_")) throw err;

    console.error("Error in UserRatingsPage:", err);
    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmptyState type="no-data" title="Error" description="An error occurred while loading this user's ratings. Check server logs for details." />
      </main>
    );
  }
}

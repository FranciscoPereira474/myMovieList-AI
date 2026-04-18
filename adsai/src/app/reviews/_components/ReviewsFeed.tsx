"use client";

import { useState, useTransition } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewFilters } from "./ReviewFilters";
import { MobileFilters } from "./mobile-filters";
import { formatDistanceToNow } from "date-fns";
import {
  getReviews,
  Review,
  ReviewFilters as ReviewFiltersType,
} from "@/app/actions/reviews";

interface ReviewsFeedProps {
  initialReviews: Review[];
  userId: string | null;
  isLoggedIn: boolean;
  authorId?: string | null;
  hideHeader?: boolean;
  initialSort?: ReviewFiltersType["sortBy"];
  authorTotalReviews?: number;
}

/**
 * * @param {ReviewsFeedProps} props
 *  * @returns {JSX.Element}
 *  
 * export function ReviewsFeed({
 *   initialReviews,
 *   userId,
 *   isLoggedIn,
 * }: ReviewsFeedProps) {
 *   const [reviews, setReviews] = useState<Review[]>(initialReviews);
 *   const [filters, setFilters] = useState<ReviewFiltersType>({
 *     hideSpoilers: false,
 *     ratingMin: 0,
 *     ratingMax: 5,
 *     friendsOnly: false,
 *     rewatchesOnly: false,
 *   });
 *   const [page, setPage] = useState(0);
 *   const [hasMore, setHasMore] = useState(initialReviews.length === 20);
 *   const [isPending, startTransition] = useTransition();
 *
 *   
 *    * Handles changes to the filters.
 *    *
 *    * @param {ReviewFiltersType} newFilters
 *    
 *   const handleFiltersChange = (newFilters: ReviewFiltersType) => {
 *     setFilters(newFilters);
 *     setPage(0);
 *     setHasMore(true);
 *
 *     // Fetch reviews with new filters
 *     startTransition(async () => {
 *       const newReviews = await getReviews(userId, newFilters, 0, 20);
 *       setReviews(newReviews);
 *       setHasMore(newReviews.length === 20);
 *     });
 *   };
 *
 *   
 *    * Loads more reviews.
 *    
 *   const handleLoadMore = () => {
 *     const nextPage = page + 1;
 *
 *     startTransition(async () => {
 *       const moreReviews = await getReviews(userId, filters, nextPage, 20);
 *       if (moreReviews.length > 0) {
 *         setReviews((prev) => [...prev, ...moreReviews]);
 *         setPage(nextPage);
 *         setHasMore(moreReviews.length === 20);
 *       } else {
 *         setHasMore(false);
 *       }
 *     });
 *   };
 *
 *   return (
 *     // ...
 *   );
 * }
 */
export function ReviewsFeed({
  initialReviews,
  userId,
  isLoggedIn,
  authorId,
  hideHeader,
  initialSort,
  authorTotalReviews,
}: ReviewsFeedProps) {
  const DEFAULT_SORT: ReviewFiltersType["sortBy"] = "popular";

  // Use undefined for rating bounds by default so server-side filtering
  // only applies when the user explicitly chooses ranges.
  const [filters, setFilters] = useState<ReviewFiltersType>(() => ({
    hideSpoilers: false,
    ratingMin: undefined,
    ratingMax: undefined,
    friendsOnly: false,
    sortBy: initialSort || DEFAULT_SORT,
  }));

  const sortReviews = (list: Review[], sortBy: ReviewFiltersType["sortBy"]) => {
    let sorted = list;
    if (sortBy === "popular") {
      sorted = [...list].sort((a, b) => {
        const popA = (a.upvotes_count || 0) + (a.downvotes_count || 0) + (a.comments_count || 0);
        const popB = (b.upvotes_count || 0) + (b.downvotes_count || 0) + (b.comments_count || 0);
        return popB - popA;
      });
    } else if (sortBy === "most_liked") {
      sorted = [...list].sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
    } else if (sortBy === "most_disliked") {
      sorted = [...list].sort((a, b) => (b.downvotes_count || 0) - (a.downvotes_count || 0));
    }
    return sorted;
  };

  const [reviews, setReviews] = useState<Review[]>(() => sortReviews(initialReviews, initialSort || DEFAULT_SORT));
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialReviews.length === 20);
  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = (newFilters: ReviewFiltersType) => {
    setFilters(newFilters);
    setPage(0);
    setHasMore(true);

    startTransition(async () => {
      const newReviews = await getReviews(userId, newFilters, 0, 20, authorId);

      // Apply client-side sorting when requested (server-side sorting not implemented)
      const sortBy = newFilters.sortBy || "popular";
      let sorted = newReviews;
      if (sortBy === "popular") {
        sorted = [...newReviews].sort((a, b) => {
          const popA = (a.upvotes_count || 0) + (a.downvotes_count || 0) + (a.comments_count || 0);
          const popB = (b.upvotes_count || 0) + (b.downvotes_count || 0) + (b.comments_count || 0);
          return popB - popA;
        });
      } else if (sortBy === "most_liked") {
        sorted = [...newReviews].sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
      } else if (sortBy === "most_disliked") {
        sorted = [...newReviews].sort((a, b) => (b.downvotes_count || 0) - (a.downvotes_count || 0));
      }

      setReviews(sorted);
      setHasMore(sorted.length === 20);
    });
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 0) return;

    startTransition(async () => {
      const newReviews = await getReviews(userId, filters, nextPage, 20, authorId);
      const sortBy = filters.sortBy || "popular";
      let sorted = newReviews;
      if (sortBy === "popular") {
        sorted = [...newReviews].sort((a, b) => {
          const popA = (a.upvotes_count || 0) + (a.downvotes_count || 0) + (a.comments_count || 0);
          const popB = (b.upvotes_count || 0) + (b.downvotes_count || 0) + (b.comments_count || 0);
          return popB - popA;
        });
      } else if (sortBy === "most_liked") {
        sorted = [...newReviews].sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
      } else if (sortBy === "most_disliked") {
        sorted = [...newReviews].sort((a, b) => (b.downvotes_count || 0) - (a.downvotes_count || 0));
      }

      setReviews(sorted);
      setPage(nextPage);
      setHasMore(sorted.length === 20);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header (only show when not hidden by parent) */}
      {!hideHeader && (
        <div className="flex items-end justify-between mb-8 border-b border-neutral-800 pb-4">
          <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reviews</h1>
          <p className="text-neutral-400 text-sm mt-1">What the community is talking about.</p>
        </div>
          {/* header controls removed - mobile controls live above the grid */}
        </div>
      )}

      {/* Mobile filters + sort (above grid) */}
      <div className="lg:hidden">
        <MobileFilters filters={filters} onFiltersChange={handleFiltersChange} hideFriendsOnly={!!authorId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block">
          <ReviewFilters filters={filters} onFiltersChange={handleFiltersChange} hideFriendsOnly={!!authorId} />
        </div>

        {/* Reviews Masonry Grid */}
        <div className="lg:col-span-3">
          {isPending && page === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-neutral-400">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                Loading reviews...
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-3">No Reviews Found</h2>
              {authorId !== undefined && authorTotalReviews !== undefined ? (
                authorTotalReviews === 0 ? (
                  <p className="text-neutral-400 mb-8 leading-relaxed">This user hasn&apos;t posted any reviews yet.</p>
                ) : (
                  <p className="text-neutral-400 mb-8 leading-relaxed">Try adjusting your filters to see more reviews.</p>
                )
              ) : (
                <p className="text-neutral-400 mb-8 leading-relaxed">Try adjusting your filters to see more reviews.</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => {
                  if (!review.profiles || !review.movies) return null;

                  const year = review.movies.release_date ? new Date(review.movies.release_date).getFullYear() : "N/A";
                  const userVote = review.user_vote?.[0] ? (review.user_vote[0].is_upvote ? "up" : "down") : null;

                  return (
                    <div key={review.id}>
                      <ReviewCard
                        reviewId={review.id}
                        user={{ name: review.profiles.username, username: review.profiles.username, avatarUrl: review.profiles.avatar_url || undefined }}
                        movie={{
                          id: review.movies.id,
                          slug: review.movies.slug,
                          title: review.movies.title,
                          year: year,
                          posterUrl: review.movies.poster_url || "https://placehold.co/400x600/222/fff?text=No+Poster",
                        }}
                        rating={review.rating / 2}
                        reviewTitle={review.title}
                        content={review.body || ""}
                        timestamp={formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        likes={review.upvotes_count}
                        dislikes={review.downvotes_count}
                        comments={review.comments_count}
                        currentUserVote={userVote}
                        isLoggedIn={isLoggedIn}
                        hasSpoiler={review.contains_spoilers}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Numbered Pagination (inspired by /movies) */}
              <nav className="mt-8 flex items-center justify-center gap-2">
                {/* Determine total pages when possible: use authorTotalReviews if provided, otherwise estimate */}
                {(() => {
                  const ITEMS_PER_PAGE = 20;
                  const currentPage = page + 1;
                  let totalPages: number;

                  if (authorTotalReviews !== undefined && authorTotalReviews !== null) {
                    totalPages = Math.max(1, Math.ceil(authorTotalReviews / ITEMS_PER_PAGE));
                  } else if (hasMore) {
                    // Unknown total; only show one page ahead of current when there's more
                    totalPages = currentPage + 1;
                  } else {
                    totalPages = currentPage;
                  }

                  const getVisiblePages = (): (number | "ellipsis")[] => {
                    const pages: (number | "ellipsis")[] = [];
                    const showEllipsisThreshold = 7;

                    if (totalPages <= showEllipsisThreshold) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("ellipsis");

                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);

                      if (currentPage < totalPages - 2) pages.push("ellipsis");
                      pages.push(totalPages);
                    }

                    return pages;
                  };

                  const visiblePages = getVisiblePages();

                  return (
                    <>
                      {/* Previous */}
                      <button
                        onClick={() => goToPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page Numbers */}
                      {visiblePages.map((p, idx) =>
                        p === "ellipsis" ? (
                          <span key={`e-${idx}`} className="px-2 text-neutral-600">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => goToPage(Number(p) - 1)}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer",
                              page + 1 === p
                                ? "bg-brand-600 text-white border border-brand-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                : "border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                            )}
                          >
                            {p}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={!hasMore}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  );
                })()}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

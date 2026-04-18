"use client";

import { useState, useTransition } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";
import { getReviews, Review, ReviewFilters } from "../_lib/queries";
import { Loader2 } from "lucide-react";

interface ReviewsFeedProps {
  initialReviews: Review[];
  userId: string | null;
}

/**
 * * @param {ReviewsFeedProps} props - The component's props.
 *  * @returns {JSX.Element} The rendered reviews feed component.
 *  
 * export function ReviewsFeed({ initialReviews, userId }: ReviewsFeedProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function ReviewsFeed({ initialReviews, userId }: ReviewsFeedProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hideSpoilers, setHideSpoilers] = useState(false);
  const [ratingRange, setRatingRange] = useState<[number, number]>([1, 5]);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [offset, setOffset] = useState(initialReviews.length);
  const [hasMore, setHasMore] = useState(initialReviews.length === 20);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const applyFilters = () => {
    startTransition(async () => {
      const filters: ReviewFilters = {
        hideSpoilers,
        ratingRange,
        friendsOnly,
      };

      const newReviews = await getReviews(userId, filters, 0, 20);
      setReviews(newReviews);
      setOffset(newReviews.length);
      setHasMore(newReviews.length === 20);
    });
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    startTransition(async () => {
      const filters: ReviewFilters = {
        hideSpoilers,
        ratingRange,
        friendsOnly,
      };

      const moreReviews = await getReviews(userId, filters, offset, 20);
      setReviews((prev) => [...prev, ...moreReviews]);
      setOffset((prev) => prev + moreReviews.length);
      setHasMore(moreReviews.length === 20);
      setIsLoadingMore(false);
    });
  };

  // Apply filters when any filter changes
  const handleFilterChange = (filterUpdater: () => void) => {
    filterUpdater();
    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => applyFilters(), 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-brand-500 text-xs">🔍</span> Filters
          </h3>

          {/* Hide Spoilers Toggle */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-neutral-300">Hide Spoilers</span>
            <button
              onClick={() =>
                handleFilterChange(() => setHideSpoilers(!hideSpoilers))
              }
              className={`w-10 h-5 rounded-full relative transition-colors ${
                hideSpoilers
                  ? "bg-brand-600 hover:bg-brand-500"
                  : "bg-neutral-700 hover:bg-neutral-600"
              }`}
              disabled={isPending}
            >
              <span
                className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${
                  hideSpoilers ? "right-1" : "left-1"
                }`}
              ></span>
            </button>
          </div>

          {/* Rating Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-300">Rating Range</label>
              <span className="text-xs text-neutral-500">
                {ratingRange[0]} - {ratingRange[1]} ★
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={0.5}
              value={ratingRange}
              onValueChange={(values) => {
                handleFilterChange(() =>
                  setRatingRange(values as [number, number])
                );
              }}
              disabled={isPending}
              className="w-full"
            />
          </div>

          <hr className="border-neutral-800 my-4" />

          {/* Filter Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={friendsOnly}
                onChange={(e) =>
                  handleFilterChange(() => setFriendsOnly(e.target.checked))
                }
                disabled={isPending}
                className="rounded bg-neutral-800 border-neutral-700 text-brand-500 focus:ring-0 cursor-pointer disabled:opacity-50"
              />
              Friends Only
            </label>
            {/* rewatchesOnly removed */}
          </div>

          {isPending && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Applying filters...
            </div>
          )}
        </div>
      </aside>

      {/* Reviews Masonry Grid */}
      <div className="lg:col-span-3">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">
              No reviews found matching your filters.
            </p>
            <button
              onClick={() => {
                  setHideSpoilers(false);
                  setRatingRange([1, 5]);
                  setFriendsOnly(false);
                  setTimeout(() => applyFilters(), 0);
                }}
              className="mt-4 text-brand-400 hover:text-brand-300 text-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {reviews.map((review) => {
                if (!review.profiles || !review.movies) {
                  return null;
                }

                const year = review.movies.release_date
                  ? new Date(review.movies.release_date).getFullYear()
                  : "N/A";
                const userVote = review.user_vote?.[0]
                  ? review.user_vote[0].is_upvote
                    ? "up"
                    : "down"
                  : null;

                return (
                  <div key={review.id} className="break-inside-avoid">
                    <ReviewCard
                      reviewId={review.id}
                      user={{
                        name: review.profiles.username,
                        username: review.profiles.username,
                        avatarUrl: review.profiles.avatar_url || undefined,
                      }}
                      movie={{
                        id: review.movies.id,
                        slug: review.movies.slug,
                        title: review.movies.title,
                        year: year,
                        posterUrl:
                          review.movies.poster_url ||
                          "https://placehold.co/400x600/222/fff?text=No+Poster",
                      }}
                      rating={review.rating / 2} // Convert 1-10 to 0-5 scale
                      reviewTitle={review.title}
                      content={review.body || ""}
                      timestamp={formatDistanceToNow(
                        new Date(review.created_at),
                        { addSuffix: true }
                      )}
                      likes={review.upvotes_count}
                      dislikes={review.downvotes_count}
                      comments={review.comments_count}
                      currentUserVote={userVote}
                      isLoggedIn={!!userId}
                      hasSpoiler={review.contains_spoilers}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore || isPending}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Reviews"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, MessageCircle, AlertTriangle, Loader2, AlertCircle, Users, Trash2, Check, Eye } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { createReview, voteOnReview, deleteReview } from "../_lib/actions";
import type { MovieReview, CurrentUser } from "../_lib/queries";

interface MovieReviewsProps {
  movieId: string; // numeric/uuid id used for server operations
  movieSlug?: string; // slug used for routing (only slug should be used in URLs)
  movieTitle: string;
  reviews: MovieReview[];
  totalReviews: number;
  currentUser: CurrentUser | null;
  followedUserIds: string[];
}

type ReviewTab = "recent" | "highest" | "friends";

/**
 * * Displays a list of movie reviews with filtering and pagination options.
 *  *
 *  * @param {MovieReviewsProps} props - The component's properties.
 *  * @returns {JSX.Element} The rendered review list component.
 *  
 *
 * export function MovieReviews({
 *   movieId,
 *   movieSlug,
 *   movieTitle,
 *   reviews,
 *   totalReviews,
 *   currentUser,
 *   followedUserIds,
 * }: MovieReviewsProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function MovieReviews({
  movieId,
  movieSlug,
  movieTitle,
  reviews,
  totalReviews,
  currentUser,
  followedUserIds,
}: MovieReviewsProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("recent");
  const [visibleCount, setVisibleCount] = useState(5);
  const REVIEWS_PER_PAGE = 5;
  const DEFAULT_VISIBLE_COUNT = 5;
  const sectionRef = useRef<HTMLElement>(null);

  const tabs: { id: ReviewTab; label: string }[] = [
    { id: "recent", label: "Most Recent" },
    { id: "highest", label: "Highest Rated" },
    { id: "friends", label: "Friends" },
  ];

  // Reset visible count when tab changes
  const handleTabChange = (tabId: ReviewTab) => {
    setActiveTab(tabId);
    setVisibleCount(REVIEWS_PER_PAGE);
  };

  // Sort/filter reviews based on active tab (operates on FULL dataset)
  const processedReviews = useMemo(() => {
    // Helper to calculate net vote score
    const getNetScore = (review: MovieReview) => 
      review.upvotes_count - review.downvotes_count;

    switch (activeTab) {
      case "recent":
        // Sort by created_at descending (most recent first)
        return [...reviews].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "highest":
        // Sort by net vote score (upvotes - downvotes) descending, tie-breaker: most recent first
        return [...reviews].sort((a, b) => {
          const scoreA = getNetScore(a);
          const scoreB = getNetScore(b);
          if (scoreB !== scoreA) {
            return scoreB - scoreA; // Higher score first
          }
          // Tie-breaker: most recent first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      case "friends":
        // Filter to only reviews from users the current user follows, then sort by recent
        return [...reviews]
          .filter((review) => followedUserIds.includes(review.user.id))
          .sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      default:
        return [...reviews];
    }
  }, [reviews, activeTab, followedUserIds]);

  // Slice AFTER sorting/filtering to get visible reviews
  const visibleReviews = useMemo(() => {
    return processedReviews.slice(0, visibleCount);
  }, [processedReviews, visibleCount]);

  // Determine if we're showing the friends empty state
  const showFriendsEmptyState = activeTab === "friends" && processedReviews.length === 0;
  
  // Check if there are more reviews to show
  const hasMoreReviews = processedReviews.length > visibleCount;
  const remainingCount = processedReviews.length - visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
    // Smooth scroll back to the top of the reviews section
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Check if we can collapse (showing more than default)
  const canCollapse = visibleCount > DEFAULT_VISIBLE_COUNT;

  return (
    <section ref={sectionRef}>
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "text-brand-400 font-bold border-b-2 border-brand-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review Form */}
      <ReviewForm movieId={movieId} movieTitle={movieTitle} currentUser={currentUser} />

      {/* Reviews List */}
      <div className="space-y-6">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review) => (
            <ReviewItem key={review.id} review={review} currentUser={currentUser} movieId={movieId} />
          ))
        ) : showFriendsEmptyState ? (
          <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <Users className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">None of your friends have reviewed this movie yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              Follow more users to see their reviews here!
            </p>
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <MessageCircle className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">No reviews yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        )}

        {/* Show More / Show Less Buttons */}
        {(hasMoreReviews || canCollapse) && (
          <div className="flex gap-3">
            {canCollapse && (
              <button
                onClick={handleShowLess}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-sm font-medium rounded-lg transition-colors border border-neutral-800 text-center cursor-pointer"
              >
                Show Less
              </button>
            )}
            {hasMoreReviews && (
              <button
                onClick={handleShowMore}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-sm font-medium rounded-lg transition-colors border border-neutral-800 text-center cursor-pointer"
              >
                Show {Math.min(remainingCount, REVIEWS_PER_PAGE)} More Reviews
              </button>
            )}
          </div>
        )}

        {/* View All Button - only show if there are more reviews than fetched */}
        {totalReviews > reviews.length && (
          movieSlug ? (
            <Link
              href={`/movies/${movieSlug}/reviews`}
              className="block w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-sm font-medium rounded-lg transition-colors border border-neutral-800 text-center"
            >
              Read All {totalReviews.toLocaleString()} Reviews
            </Link>
          ) : (
            <button className="block w-full py-3 bg-neutral-900 text-neutral-500 text-sm font-medium rounded-lg border border-neutral-800 text-center" disabled>
              Read All {totalReviews.toLocaleString()} Reviews
            </button>
          )
        )}
      </div>
    </section>
  );
}

interface ReviewFormProps {
  movieId: string;
  movieTitle: string;
  currentUser: CurrentUser | null;
}

function ReviewForm({ movieId, movieTitle, currentUser }: ReviewFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // If not logged in, show a prompt to sign in
  if (!currentUser) {
    return (
      <div className="bg-neutral-900 rounded-lg p-4 mb-8 border border-neutral-800">
        <p className="text-sm text-neutral-400 text-center">
          <Link href={`/login?redirect=/movies/${movieId}`} className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>{" "}
          to leave a review for <strong className="text-white">{movieTitle}</strong>
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!body.trim()) {
      setError("Please write something in your review");
      return;
    }

    startTransition(async () => {
      const result = await createReview(movieId, {
        title: title.trim() || undefined,
        body: body.trim(),
        containsSpoilers,
      });

      if (result.success) {
        // Clear form on success
        setTitle("");
        setBody("");
        setContainsSpoilers(false);
      } else {
        setError(result.error || "Failed to submit review");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-lg p-4 mb-8 border border-neutral-800 flex gap-4">
      <div className="shrink-0">
        {/* User avatar */}
        {currentUser.avatar_url ? (
          <Image
            src={currentUser.avatar_url}
            alt={currentUser.username}
            width={40}
            height={40}
            className="rounded-full border border-neutral-800"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-sm font-medium">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-3">
        <label className="text-sm text-neutral-400 block">
          Review <strong className="text-white">{movieTitle}</strong>
        </label>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/50 rounded px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          maxLength={200}
          disabled={isPending}
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50"
        />

        {/* Body Textarea */}
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={10000}
            disabled={isPending}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none disabled:opacity-50"
            placeholder="Write your thoughts here..."
          />
        </div>

        {/* Footer: Spoiler toggle + Submit */}
        <div className="flex items-center justify-between">
          <label className="group flex items-center gap-3 text-sm text-neutral-400 cursor-pointer hover:text-neutral-300 transition-colors select-none">
            {/* Hidden native input for accessibility */}
            <input
              type="checkbox"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              disabled={isPending}
              className="peer sr-only"
            />
            {/* Toggle Switch Track */}
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-neutral-700 bg-neutral-800 transition-colors duration-200 peer-checked:bg-brand-600 peer-checked:border-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-neutral-950 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
              {/* Toggle Switch Thumb */}
              <span className="pointer-events-none inline-block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-neutral-400 shadow-sm transition-transform duration-200 peer-checked:translate-x-4 peer-checked:bg-white group-has-[:checked]:translate-x-4 group-has-[:checked]:bg-white" />
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            Contains spoilers
          </label>

          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Review"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

interface ReviewItemProps {
  review: MovieReview;
  currentUser: CurrentUser | null;
  movieId: string;
}

function ReviewItem({ review, currentUser, movieId }: ReviewItemProps) {
  const router = useRouter();
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(review.currentUserVote);
  const [upvotes, setUpvotes] = useState(review.upvotes_count);
  const [downvotes, setDownvotes] = useState(review.downvotes_count);
  const [isVoting, startVoting] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  const timeAgo = getTimeAgo(review.created_at);
  // user_rating is from the ratings table (1-10 scale), convert to 1-5 for display
  const rating = review.user_rating ? review.user_rating / 2 : null;
  
  // Check if current user is the author of this review
  const isAuthor = currentUser?.id === review.user.id;

  // Auto-reset confirmation state after 3 seconds
  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => {
        setIsConfirming(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  const handleDeleteClick = () => {
    if (!isConfirming) {
      // First click: show confirmation
      setIsConfirming(true);
      return;
    }

    // Second click: actually delete
    startDeleting(async () => {
      const result = await deleteReview(review.id, movieId);
      if (!result.success) {
        console.error("Delete error:", result.error);
        setIsConfirming(false);
      }
    });
  };

  const handleVote = (voteType: "up" | "down") => {
    if (!currentUser) {
      // Could redirect to login, but for now just ignore
      return;
    }

    // Calculate optimistic update
    const wasUpvoted = userVote === "up";
    const wasDownvoted = userVote === "down";
    const isUpvote = voteType === "up";

    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    let newUserVote: "up" | "down" | null = null;

    if (isUpvote) {
      if (wasUpvoted) {
        // Clicking upvote again - remove vote
        newUpvotes--;
        newUserVote = null;
      } else {
        // Adding upvote
        newUpvotes++;
        if (wasDownvoted) {
          newDownvotes--;
        }
        newUserVote = "up";
      }
    } else {
      if (wasDownvoted) {
        // Clicking downvote again - remove vote
        newDownvotes--;
        newUserVote = null;
      } else {
        // Adding downvote
        newDownvotes++;
        if (wasUpvoted) {
          newUpvotes--;
        }
        newUserVote = "down";
      }
    }

    // Optimistic update
    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);

    // Actual API call
    startVoting(async () => {
      const result = await voteOnReview(review.id, voteType);

      if (!result.success) {
        // Rollback on error
        setUpvotes(upvotes);
        setDownvotes(downvotes);
        setUserVote(userVote);
        console.error("Vote error:", result.error);
      } else if (result.upvotes !== undefined && result.downvotes !== undefined) {
        // Update with actual server values
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        setUserVote(result.userVote ?? null);
      }
    });
  };

  const handleCardClick = () => {
    // Prevent navigation if text is selected
    if (window.getSelection()?.toString()) return;
    router.push(`/reviews/${review.id}`);
  };

  return (
    <article 
      className="flex gap-4 p-4 -mx-4 rounded-xl hover:bg-neutral-900/40 transition-colors cursor-pointer group/card"
      onClick={handleCardClick}
    >
      <div className="shrink-0">
        <Link href={`/users/${review.user.username}`} onClick={(e) => e.stopPropagation()}>
          {review.user.avatar_url ? (
            <Image
              src={review.user.avatar_url}
              alt={review.user.username}
              width={40}
              height={40}
              className="rounded-full border border-neutral-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-sm font-medium">
              {review.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>
      <div className="flex-1 min-w-0 pb-6 border-b border-neutral-800">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${review.user.username}`}
              className="font-bold text-neutral-200 text-sm hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {review.user.username}
            </Link>
            {rating && <StarRating value={rating} size="xs" color="brand" />}
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/reviews/${review.id}`} 
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {timeAgo}
            </Link>
            {isAuthor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                disabled={isDeleting}
                className="relative w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={isConfirming ? "Click to confirm delete" : "Delete review"}
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500 absolute inset-0 m-auto" />
                ) : (
                  <>
                    {/* Trash Icon - visible when not confirming */}
                    <Trash2
                      className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${
                        isConfirming ? "scale-0 opacity-0" : "scale-100 opacity-100"
                      }`}
                    />
                    {/* Check Icon - visible when confirming */}
                    <Check
                      className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${
                        isConfirming ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      }`}
                    />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Review Title (new field) */}
        {review.title && (
          <Link
            href={`/reviews/${review.id}`}
            className="block group"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-semibold text-white mb-1 break-words hyphens-auto group-hover:text-brand-400 transition-colors whitespace-normal">
              {review.title}
            </h4>
          </Link>
        )}

        {/* Review Body (blur only the description when spoiler) */}
        <div className="relative mb-3">
          <p
            className={
              `text-neutral-300 text-sm leading-relaxed break-words hyphens-auto transition-all duration-500 filter ` +
              (review.contains_spoilers && !spoilerRevealed ? "blur-sm brightness-95 select-none pointer-events-none opacity-80" : "")
            }
          >
            {review.contains_spoilers && !spoilerRevealed ? review.body ? review.body : "[Click to reveal spoiler review]" : review.body}
          </p>

          {/* Centered reveal button over the blurred description */}
          {review.contains_spoilers && !spoilerRevealed && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSpoilerRevealed(true);
                }}
                className="pointer-events-auto bg-white text-black hover:bg-neutral-200 rounded-full font-bold flex items-center gap-2 cursor-pointer px-3 py-1"
              >
                <Eye size={14} />
                Reveal Spoiler
              </button>
            </div>
          )}
        </div>

        {/* Actions - Voting & Comments */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          {/* Upvote Button with Count */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("up");
            }}
            disabled={isVoting || !currentUser}
            className={`flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed ${
              userVote === "up"
                ? "text-brand-400"
                : "hover:text-brand-400"
            } ${!currentUser ? "opacity-50" : ""}`}
            title={currentUser ? "Upvote" : "Sign in to vote"}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${userVote === "up" ? "fill-current" : ""}`} />
            <span>{formatCount(upvotes)}</span>
          </button>

          {/* Downvote Button with Count */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("down");
            }}
            disabled={isVoting || !currentUser}
            className={`flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed ${
              userVote === "down"
                ? "text-red-400"
                : "hover:text-red-400"
            } ${!currentUser ? "opacity-50" : ""}`}
            title={currentUser ? "Downvote" : "Sign in to vote"}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${userVote === "down" ? "fill-current" : ""}`} />
            <span>{formatCount(downvotes)}</span>
          </button>

          {/* Separator */}
          <span className="text-neutral-700">|</span>

          {/* Comments Button */}
          <Link 
            href={`/reviews/${review.id}#comments-section`}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {review.comments_count > 0 && review.comments_count}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

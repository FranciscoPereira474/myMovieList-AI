"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { StarRating } from "./star-rating";
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { voteOnReview } from "@/app/actions/review-votes";

export interface ReviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Review ID for voting */
  reviewId: string;
  /** Reviewer information */
  user: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
  /** Movie information */
  movie: {
    id: string;
    slug?: string;
    title: string;
    year: number | string;
    posterUrl: string;
  };
  /** Review rating (0-5 scale) */
  rating: number;
  /** Review title */
  reviewTitle?: string | null;
  /** Review text content */
  content: string;
  /** Timestamp display string */
  timestamp: string;
  /** Number of likes (upvotes) */
  likes?: number;
  /** Number of dislikes (downvotes) */
  dislikes?: number;
  /** Number of comments */
  comments?: number;
  /** Current user's vote status */
  currentUserVote?: "up" | "down" | null;
  /** Whether the current user is logged in */
  isLoggedIn?: boolean;
  /** Whether review contains spoilers */
  hasSpoiler?: boolean;
  /** Variant style */
  variant?: "default" | "compact" | "full";
}
/**
 * * @param {ReviewCardProps} props - Review card component props
 *  * @returns {JSX.Element} - The review card component
 *  
 * export function ReviewCard({
 *   reviewId,
 *   user,
 *   movie,
 *   rating,
 *   reviewTitle,
 *   content,
 *   timestamp,
 *   likes = 0,
 *   dislikes = 0,
 *   comments = 0,
 *   currentUserVote = null,
 *   isLoggedIn = false,
 *   hasSpoiler = false,
 *   variant = "default",
 *   className,
 *   ...props
 * }: ReviewCardProps) {
 *   const [spoilerRevealed, setSpoilerRevealed] = React.useState(false);
 *   
 *   // Optimistic state for voting
 *   const [optimisticLikes, setOptimisticLikes] = React.useState(likes);
 *   const [optimisticDislikes, setOptimisticDislikes] = React.useState(dislikes);
 *   const [optimisticUserVote, setOptimisticUserVote] = React.useState<"up" | "down" | null>(currentUserVote);
 *   const [isVoting, setIsVoting] = React.useState(false);
 *
 *   // Sync optimistic state with props when they change
 *   React.useEffect(() => {
 *     setOptimisticLikes(likes);
 *     setOptimisticDislikes(dislikes);
 *     setOptimisticUserVote(currentUserVote);
 *   }, [likes, dislikes, currentUserVote]);
 *
 *   const router = useRouter();
 *
 *   const navigateToReview = React.useCallback(() => {
 *     router.push(`/reviews/${reviewId}`);
 *   }, [router, reviewId]);
 *
 *   const handleKeyDown = (e: React.KeyboardEvent) => {
 *     if (e.key === "Enter" || e.key === " ") {
 *       e.preventDefault();
 *       navigateToReview();
 *     }
 *   };
 *
 *   const handleVote = async (voteType: "up" | "down") => {
 *     // Redirect to login if not authenticated
 *     if (!isLoggedIn) {
 *       console.log("Redirecting to login - user not authenticated");
 *       router.push("/login");
 *       return;
 *     }
 *
 *     // Prevent voting if already voting
 *     if (isVoting) return;
 *
 *     setIsVoting(true);
 *
 *     // Calculate optimistic update
 *     const previousVote = optimisticUserVote;
 *     let newLikes = optimisticLikes;
 *     let newDislikes = optimisticDislikes;
 *     let newUserVote: "up" | "down" | null = null;
 *
 *     if (previousVote === voteType) {
 *       // Toggling off the same vote
 *       if (voteType === "up") {
 *         newLikes = optimisticLikes - 1;
 *       } else {
 *         newDislikes = optimisticDislikes - 1;
 *       }
 *       newUserVote = null;
 *     } else if (previousVote === null) {
 *       // Adding a new vote
 *       if (voteType === "up") {
 *         newLikes = optimisticLikes + 1;
 *       } else {
 *         newDislikes = optimisticDislikes + 1;
 *       }
 *       newUserVote = voteType;
 *     } else {
 *       // Switching vote
 *       if (voteType === "up") {
 *         newLikes = optimisticLikes + 1;
 *         newDislikes = optimisticDislikes - 1;
 *       } else {
 *         newLikes = optimisticLikes - 1;
 *         newDislikes = optimisticDislikes + 1;
 *       }
 *       newUserVote = voteType;
 *     }
 *
 *     // Apply optimistic update
 *     setOptimisticLikes(newLikes);
 *     setOptimisticDislikes(newDislikes);
 *     setOptimisticUserVote(newUserVote);
 *
 *     try {
 *       const result = await voteOnReview(reviewId, voteType);
 *
 *       if (result.success) {
 *         // Update with server response
 *         setOptimisticLikes(result.upvotes ?? newLikes);
 *         setOptimisticDislikes(result.downvotes ?? newDislikes);
 *         setOptimisticUserVote(result.userVote ?? null);
 *       } else {
 *         // Revert on error
 *         setOptimisticLikes(likes);
 *         setOptimisticDislikes(dislikes);
 *         setOptimisticUserVote(currentUserVote);
 *         console.error("Vote failed:", result.error);
 *       }
 *     } catch (error) {
 *       // Revert on error
 *       setOptimisticLikes(likes);
 *       setOptimisticDislikes(dislikes);
 *       setOptimisticUserVote(currentUserVote);
 *       console.error("Vote error:", error);
 *     } finally {
 *       setIsVoting(false);
 *     }
 *   };
 *
 *   return (
 *     <article
 *       role="link"
 *       tabIndex={0}
 *       onKeyDown={handleKeyDown}
 *       onClick={navigateToReview}
 *       className={cn(
 *         "bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-brand-500/50 transition-colors duration-300 cursor-pointer group",
 *         variant === "compact" && "p-3",
 *         className
 *       )}
 *       {...props}
 *     >
 *       {/* Header: User + Rating + Timestamp }
 *       <div className="flex items-start justify-between mb-3">
 *         <div className="flex items-center gap-2">
 *           <Link href={`/users/${user.username}`} onClick={(e) => e.stopPropagation()}>
 *             <UserAvatar src={user.avatarUrl} alt={user.name} size="sm" />
 *           </Link>
 *           <div className="flex flex-col gap-0.5">
 *             <Link
 *               href={`/users/${user.username}`}
 *               onClick={(e) => e.stopPropagation()}
 *               className="text-xs font-bold text-neutral-300 hover:text-white transition-colors"
 *             >
 *               {user.username}
 *             </Link>
 *             <StarRating value={rating} size="xs" color="brand" />
 *           </div>
 *         </div>
 *         <span className="text-[10px] text-neutral-500">{timestamp}</span>
 *       </div>
 *
 *       {/* Title + Content wrapper (relative) so spoiler overlay can sit absolutely and avoid layout shifts }
 *       <div className="relative mb-4">
 *         {/* Spoiler overlay centered over title+content }
 *         {hasSpoiler && !spoilerRevealed && (
 *           <div
 *             role="button"
 *             tabIndex={0}
 *             onClick={(e) => {
 *               e.stopPropagation();
 *               setSpoilerRevealed(true);
 *             }}
 *             onKeyDown={(e) => {
 *               if (e.key === "Enter" || e.key === " ") {
 *                 e.preventDefault();
 *                 e.stopPropagation();
 *                 setSpoilerRevealed(true);
 *               }
 *             }}
 *             className="absolute inset-0 z-10 flex items-center justify-between px-4 bg-neutral-950/70 rounded-md border border-neutral-800/50 text-center gap-2 group"
 *           >
 *             <div className="flex items-center gap-3">
 *               <span className="text-yellow-500 text-sm">⚠️</span>
 *               <div className="text-xs font-bold text-neutral-200 truncate hover:text-white transition-colors">
 *                 {movie.title}
 *               </div>
 *             </div>
 *           </div>
 *         )}
 *         {/* Review title }
 *         <h2 className="text-lg font-bold">{reviewTitle}</h2>
 *
 *         {/* Review content }
 *         <p>{content}</p>
 *
 *         {/* Timestamp }
 *         <span className="text-[10px] text-neutral-500">{timestamp}</span>
 *
 *         {/* Actions }
 *         <div className="flex items-center gap-3">
 *           {/* Upvote/Like Button }
 *           <button
 *             onClick={(e) => {
 *               e.preventDefault();
 *               e.stopPropagation();
 *               handleVote("up");
 *             }}
 *             disabled={!isLoggedIn || isVoting}
 *             className={cn(
 *               "text-xs transition-colors flex items-center gap-1",
 *               !isLoggedIn 
 *                 ? "cursor-not-allowed text-neutral-600" 
 *                 : isVoting 
 *                   ? "cursor-wait text-neutral-500"
 *                   : "cursor-pointer",
 *               isLoggedIn && optimisticUserVote === "up"
 *                 ? "text-green-500"
 *                 : isLoggedIn && !isVoting && "text-neutral-500 hover:text-green-400"
 *             )}
 *             title={!isLoggedIn ? "Log in to vote" : undefined}
 *           >
 *             <ThumbsUp size={12} className={optimisticUserVote === "up" ? "fill-current" : ""} />
 *             <span>{optimisticLikes}</span>
 *           </button>
 *
 *           {/* Downvote/Dislike Button }
 *           <button
 *             onClick={(e) => {
 *               e.preventDefault();
 *               e.stopPropagation();
 *               handleVote("down");
 *             }}
 *             disabled={!isLoggedIn || isVoting}
 *             className={cn(
 *               "text-xs transition-colors flex items-center gap-1",
 *               !isLoggedIn 
 *                 ? "cursor-not-allowed text-neutral-600" 
 *                 : isVoting 
 *                   ? "cursor-wait text-neutral-500"
 *                   : "cursor-pointer",
 *               isLoggedIn && optimisticUserVote === "down"
 *                 ? "text-red-500"
 *                 : isLoggedIn && !isVoting && "text-neutral-500 hover:text-red-400"
 *             )}
 *             title={!isLoggedIn ? "Log in to vote" : undefined}
 *           >
 *             <ThumbsDown size={12} className={optimisticUserVote === "down" ? "fill-current" : ""} />
 *             <span>{optimisticDislikes}</span>
 *           </button>
 *
 *           {/* Comments Button - link to review page (comments) }
 *           <Link
 *             href={`/reviews/${reviewId}`}
 *             onClick={(e) => e.stopPropagation()}
 *             className="text-xs text-neutral-500 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
 *             title="View comments"
 *           >
 *             <MessageCircle size={12} />
 *             <span>{comments}</span>
 *           </Link>
 *         </div>
 *       </div>
 *     </article>
 *   );
 * }
 */
export function ReviewCard({
  reviewId,
  user,
  movie,
  rating,
  reviewTitle,
  content,
  timestamp,
  likes = 0,
  dislikes = 0,
  comments = 0,
  currentUserVote = null,
  isLoggedIn = false,
  hasSpoiler = false,
  variant = "default",
  className,
  ...props
}: ReviewCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = React.useState(false);
  
  // Optimistic state for voting
  const [optimisticLikes, setOptimisticLikes] = React.useState(likes);
  const [optimisticDislikes, setOptimisticDislikes] = React.useState(dislikes);
  const [optimisticUserVote, setOptimisticUserVote] = React.useState<"up" | "down" | null>(currentUserVote);
  const [isVoting, setIsVoting] = React.useState(false);

  // Sync optimistic state with props when they change
  React.useEffect(() => {
    setOptimisticLikes(likes);
    setOptimisticDislikes(dislikes);
    setOptimisticUserVote(currentUserVote);
  }, [likes, dislikes, currentUserVote]);

  const router = useRouter();

  const [isHoveringCard, setIsHoveringCard] = React.useState(false);
  const [isHoveringMovieLink, setIsHoveringMovieLink] = React.useState(false);

  const navigateToReview = React.useCallback(() => {
    router.push(`/reviews/${reviewId}`);
  }, [router, reviewId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToReview();
    }
  };

  const handleVote = async (voteType: "up" | "down") => {
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      console.log("Redirecting to login - user not authenticated");
      router.push("/login");
      return;
    }

    // Prevent voting if already voting
    if (isVoting) return;

    setIsVoting(true);

    // Calculate optimistic update
    const previousVote = optimisticUserVote;
    let newLikes = optimisticLikes;
    let newDislikes = optimisticDislikes;
    let newUserVote: "up" | "down" | null = null;

    if (previousVote === voteType) {
      // Toggling off the same vote
      if (voteType === "up") {
        newLikes = optimisticLikes - 1;
      } else {
        newDislikes = optimisticDislikes - 1;
      }
      newUserVote = null;
    } else if (previousVote === null) {
      // Adding a new vote
      if (voteType === "up") {
        newLikes = optimisticLikes + 1;
      } else {
        newDislikes = optimisticDislikes + 1;
      }
      newUserVote = voteType;
    } else {
      // Switching vote
      if (voteType === "up") {
        newLikes = optimisticLikes + 1;
        newDislikes = optimisticDislikes - 1;
      } else {
        newLikes = optimisticLikes - 1;
        newDislikes = optimisticDislikes + 1;
      }
      newUserVote = voteType;
    }

    // Apply optimistic update
    setOptimisticLikes(newLikes);
    setOptimisticDislikes(newDislikes);
    setOptimisticUserVote(newUserVote);

    try {
      const result = await voteOnReview(reviewId, voteType);

      if (result.success) {
        // Update with server response
        setOptimisticLikes(result.upvotes ?? newLikes);
        setOptimisticDislikes(result.downvotes ?? newDislikes);
        setOptimisticUserVote(result.userVote ?? null);
      } else {
        // Revert on error
        setOptimisticLikes(likes);
        setOptimisticDislikes(dislikes);
        setOptimisticUserVote(currentUserVote);
        console.error("Vote failed:", result.error);
      }
    } catch (error) {
      // Revert on error
      setOptimisticLikes(likes);
      setOptimisticDislikes(dislikes);
      setOptimisticUserVote(currentUserVote);
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={navigateToReview}
      onMouseEnter={() => setIsHoveringCard(true)}
      onMouseLeave={() => setIsHoveringCard(false)}
      className={cn(
        "bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-brand-500/50 transition-colors duration-300 cursor-pointer group",
        variant === "compact" && "p-3",
        className
      )}
      {...props}
    >
      {/* Header: User + Rating + Timestamp */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link href={`/users/${user.username}`} onClick={(e) => e.stopPropagation()}>
            <UserAvatar src={user.avatarUrl} alt={user.name} size="sm" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/users/${user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-neutral-300 hover:text-white transition-colors"
            >
              {user.username}
            </Link>
            <StarRating value={rating} size="xs" color="brand" />
          </div>
        </div>
        <span className="text-[10px] text-neutral-500">{timestamp}</span>
      </div>

      {/* Title + Content wrapper (relative) so spoiler overlay can sit absolutely and avoid layout shifts */}
      <div className="relative mb-4">
        {/* Centered reveal button overlay (matches user & movie review cards) */}
        {hasSpoiler && !spoilerRevealed && (
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

        {/* Review Title */}
        {reviewTitle && (
          <Link href={`/reviews/${reviewId}`} onClick={(e) => e.stopPropagation()} className="block mb-2 group/title">
            <h3
              className={cn(
                "text-sm font-semibold break-words hyphens-auto line-clamp-2 transition-colors",
                // smooth blur transition wrapper classes
                "transition-all duration-500 filter",
                // default color
                !isHoveringCard ? "text-neutral-100" : "",
                // when hovering the card and NOT hovering the movie link, show brand color
                isHoveringCard && !isHoveringMovieLink ? "text-brand-500" : "",
                // blur + prevent interaction when spoiler hidden
                hasSpoiler && !spoilerRevealed ? "blur-sm brightness-95 select-none pointer-events-none opacity-80" : ""
              )}
            >
              {reviewTitle}
            </h3>
          </Link>
        )}

        {/* Review Content */}
        <Link href={`/reviews/${reviewId}`} onClick={(e) => e.stopPropagation()} className="block group/content">
          <p
            className={cn(
              "text-sm text-neutral-300 leading-relaxed line-clamp-3 break-words hyphens-auto group-hover/content:text-neutral-200 transition-colors",
              "transition-all duration-500 filter",
              hasSpoiler && !spoilerRevealed ? "blur-sm brightness-95 select-none pointer-events-none opacity-80" : ""
            )}
          >
            {content}
          </p>
        </Link>
      </div>

      {/* Footer: Movie + Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
        {/* Movie Poster Thumbnail (go to movie page) */}
        {movie.slug ? (
          <Link
            href={`/movies/${movie.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
            onMouseEnter={() => setIsHoveringMovieLink(true)}
            onMouseLeave={() => setIsHoveringMovieLink(false)}
          >
            <div className="w-8 h-12 rounded overflow-hidden border border-neutral-800 relative">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          </Link>
        ) : (
          <div className="shrink-0">
            <div className="w-8 h-12 rounded overflow-hidden border border-neutral-800 relative">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          </div>
        )}

        {/* Movie Info */}
        <div className="flex-1 min-w-0">
          {movie.slug ? (
            <Link
              href={`/movies/${movie.slug}`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsHoveringMovieLink(true)}
              onMouseLeave={() => setIsHoveringMovieLink(false)}
            >
              <h4 className={cn("text-xs font-bold truncate transition-colors", isHoveringMovieLink ? "text-brand-500" : "text-neutral-200 hover:text-white")}>
                {movie.title}
              </h4>
            </Link>
          ) : (
            <h4 className="text-xs font-bold text-neutral-200 truncate">
              {movie.title}
            </h4>
          )}
          <span className="text-[10px] text-neutral-500">{movie.year}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Upvote/Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVote("up");
            }}
            disabled={!isLoggedIn || isVoting}
            className={cn(
              "text-xs transition-colors flex items-center gap-1",
              !isLoggedIn 
                ? "cursor-not-allowed text-neutral-600" 
                : isVoting 
                  ? "cursor-wait text-neutral-500"
                  : "cursor-pointer",
              isLoggedIn && optimisticUserVote === "up"
                ? "text-green-500"
                : isLoggedIn && !isVoting && "text-neutral-500 hover:text-green-400"
            )}
            title={!isLoggedIn ? "Log in to vote" : undefined}
          >
            <ThumbsUp size={12} className={optimisticUserVote === "up" ? "fill-current" : ""} />
            <span>{optimisticLikes}</span>
          </button>

          {/* Downvote/Dislike Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVote("down");
            }}
            disabled={!isLoggedIn || isVoting}
            className={cn(
              "text-xs transition-colors flex items-center gap-1",
              !isLoggedIn 
                ? "cursor-not-allowed text-neutral-600" 
                : isVoting 
                  ? "cursor-wait text-neutral-500"
                  : "cursor-pointer",
              isLoggedIn && optimisticUserVote === "down"
                ? "text-red-500"
                : isLoggedIn && !isVoting && "text-neutral-500 hover:text-red-400"
            )}
            title={!isLoggedIn ? "Log in to vote" : undefined}
          >
            <ThumbsDown size={12} className={optimisticUserVote === "down" ? "fill-current" : ""} />
            <span>{optimisticDislikes}</span>
          </button>

          {/* Comments Button - link to review page (comments) */}
          <Link
            href={`/reviews/${reviewId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-neutral-500 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
            title="View comments"
          >
            <MessageCircle size={12} />
            <span>{comments}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

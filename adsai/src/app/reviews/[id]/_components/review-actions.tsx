"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { voteOnReview } from "@/app/actions/review-votes";
import { deleteReview } from "@/app/actions/review-management";

interface ReviewActionsProps {
  reviewId: string;
  upvotes: number;
  downvotes: number;
  commentsCount?: number;
  currentUserVote: "up" | "down" | null;
  isLoggedIn: boolean;
  currentUserId?: string;
  reviewAuthorId: string;
  movieId: string;
}

/**
 * * @param {ReviewActionsProps} props - The component's props.
 *  * @returns {JSX.Element} The JSX element representing the Review Actions component.
 *  
 *
 * export function ReviewActions({
 *   reviewId,
 *   upvotes: initialUpvotes,
 *   downvotes: initialDownvotes,
 *   commentsCount,
 *   currentUserVote: initialUserVote,
 *   isLoggedIn,
 *   currentUserId,
 *   reviewAuthorId,
 *   movieId,
 * }: ReviewActionsProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function ReviewActions({
  reviewId,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  currentUserVote: initialUserVote,
  isLoggedIn,
  currentUserId,
  reviewAuthorId,
  movieId,
}: ReviewActionsProps) {
  const router = useRouter();
  const [upvotes, setUpvotes] = React.useState(initialUpvotes);
  const [downvotes, setDownvotes] = React.useState(initialDownvotes);
  const [userVote, setUserVote] = React.useState(initialUserVote);
  const [isVoting, setIsVoting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showCopiedToast, setShowCopiedToast] = React.useState(false);
  const [, setTooltipOpen] = React.useState(false);
  
  const canDelete = currentUserId && currentUserId === reviewAuthorId;

  const handleVote = async (type: "up" | "down") => {
    if (!isLoggedIn) {
      console.log("Redirecting to login - user not authenticated");
      router.push("/login");
      return;
    }
    if (isVoting) return;

    // Optimistic update
    const previousVote = userVote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    setIsVoting(true);

    // Calculate new state
    if (userVote === type) {
      // Remove vote
      setUserVote(null);
      if (type === "up") setUpvotes((prev) => prev - 1);
      else setDownvotes((prev) => prev - 1);
    } else {
      // Change or add vote
      setUserVote(type);
      if (type === "up") {
        setUpvotes((prev) => prev + 1);
        if (previousVote === "down") setDownvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev + 1);
        if (previousVote === "up") setUpvotes((prev) => prev - 1);
      }
    }

    try {
      const result = await voteOnReview(reviewId, type);
      if (!result.success) {
        // Revert on error
        setUserVote(previousVote);
        setUpvotes(previousUpvotes);
        setDownvotes(previousDownvotes);
      }
    } catch {
      // Revert on error
      setUserVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTooltipOpen(true);
      setTimeout(() => {
        setShowCopiedToast(false);
        setTooltipOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        // Redirect to movie page after successful deletion
        router.push(`/movies/${movieId}`);
      } else {
        alert(result.error || "Failed to delete review");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Failed to delete review", error);
      alert("An error occurred while deleting the review");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-neutral-800/50 rounded-lg p-1 border border-neutral-800">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-2 px-3 hover:bg-neutral-700 cursor-pointer",
            userVote === "up" && "text-green-500 hover:text-green-400 hover:bg-green-500/10"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote("up");
          }}
          disabled={isVoting}
        >
          <ThumbsUp className={cn("h-4 w-4", userVote === "up" && "fill-current")} />
          <span>{upvotes}</span>
        </Button>
        <div className="w-px h-4 bg-neutral-700 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-2 px-3 hover:bg-neutral-700 cursor-pointer",
            userVote === "down" && "text-red-500 hover:text-red-400 hover:bg-red-500/10"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote("down");
          }}
          disabled={isVoting}
        >
          <ThumbsDown className={cn("h-4 w-4", userVote === "down" && "fill-current")} />
          <span>{downvotes}</span>
        </Button>
      </div>

      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 text-neutral-400 hover:text-red-500 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete review"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden min-[500px]:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
        </button>
      )}

      {showCopiedToast ? (
        <div className="ml-auto flex items-center gap-2 text-brand-400 text-sm font-medium">
          <Check className="h-4 w-4" />
          <span>Link copied!</span>
        </div>
      ) : (
        <button
          onClick={handleShare}
          className="ml-auto flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden min-[500px]:inline">Share this review</span>
        </button>
      )}
    </div>
  );
}

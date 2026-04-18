"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { voteOnComment } from "@/app/actions/comment-votes";

interface CommentVoteButtonsProps {
  commentId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: "up" | "down" | null;
  isLoggedIn: boolean;
}

/**
 * * Renders a component with upvote and downvote buttons for a comment.
 *  *
 *  * @param {CommentVoteButtonsProps} props - The properties of the component.
 *  * @returns {JSX.Element} The JSX element representing the component.
 *  
 * export function CommentVoteButtons({
 *   commentId,
 *   initialUpvotes,
 *   initialDownvotes,
 *   initialUserVote,
 *   isLoggedIn,
 * }: CommentVoteButtonsProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function CommentVoteButtons({
  commentId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  isLoggedIn,
}: CommentVoteButtonsProps) {
  const [upvotes, setUpvotes] = React.useState(initialUpvotes);
  const [downvotes, setDownvotes] = React.useState(initialDownvotes);
  const [userVote, setUserVote] = React.useState<"up" | "down" | null>(initialUserVote);
  const [isVoting, setIsVoting] = React.useState(false);

  // Sync with props when they change
  React.useEffect(() => {
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
    setUserVote(initialUserVote);
  }, [initialUpvotes, initialDownvotes, initialUserVote]);

  const handleVote = async (voteType: "up" | "down") => {
    if (!isLoggedIn || isVoting) return;

    setIsVoting(true);

    // Calculate optimistic update
    const previousVote = userVote;
    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    let newUserVote: "up" | "down" | null = null;

    if (previousVote === voteType) {
      // Toggling off the same vote
      if (voteType === "up") {
        newUpvotes = upvotes - 1;
      } else {
        newDownvotes = downvotes - 1;
      }
      newUserVote = null;
    } else if (previousVote === null) {
      // Adding a new vote
      if (voteType === "up") {
        newUpvotes = upvotes + 1;
      } else {
        newDownvotes = downvotes + 1;
      }
      newUserVote = voteType;
    } else {
      // Switching vote
      if (voteType === "up") {
        newUpvotes = upvotes + 1;
        newDownvotes = downvotes - 1;
      } else {
        newUpvotes = upvotes - 1;
        newDownvotes = downvotes + 1;
      }
      newUserVote = voteType;
    }

    // Apply optimistic update
    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);

    try {
      const result = await voteOnComment(commentId, voteType);

      if (result.success) {
        // Update with server response
        setUpvotes(result.upvotes ?? newUpvotes);
        setDownvotes(result.downvotes ?? newDownvotes);
        setUserVote(result.userVote ?? null);
      } else {
        // Revert on error
        setUpvotes(initialUpvotes);
        setDownvotes(initialDownvotes);
        setUserVote(initialUserVote);
        console.error("Vote failed:", result.error);
      }
    } catch (error) {
      // Revert on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      setUserVote(initialUserVote);
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote("up")}
        disabled={!isLoggedIn || isVoting}
        className={cn(
          "text-xs transition-colors flex items-center gap-1",
          !isLoggedIn
            ? "cursor-not-allowed text-neutral-600"
            : isVoting
              ? "cursor-wait text-neutral-500"
              : "cursor-pointer",
          isLoggedIn && userVote === "up"
            ? "text-green-500"
            : isLoggedIn && !isVoting && "text-neutral-500 hover:text-green-400"
        )}
        title={!isLoggedIn ? "Log in to vote" : undefined}
      >
        <ThumbsUp size={14} className={userVote === "up" ? "fill-current" : ""} />
        <span>{upvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote("down")}
        disabled={!isLoggedIn || isVoting}
        className={cn(
          "text-xs transition-colors flex items-center gap-1",
          !isLoggedIn
            ? "cursor-not-allowed text-neutral-600"
            : isVoting
              ? "cursor-wait text-neutral-500"
              : "cursor-pointer",
          isLoggedIn && userVote === "down"
            ? "text-red-500"
            : isLoggedIn && !isVoting && "text-neutral-500 hover:text-red-400"
        )}
        title={!isLoggedIn ? "Log in to vote" : undefined}
      >
        <ThumbsDown size={14} className={userVote === "down" ? "fill-current" : ""} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}

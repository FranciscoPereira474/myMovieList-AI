"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import Link from "next/link";

export interface CommentThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Comment data */
  comment: {
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    dislikes: number;
    userVote?: 1 | -1 | null;
  };
  /** Author information */
  author: {
    name: string;
    username: string;
    avatarUrl?: string;
    id: string; // Author's user ID for permission check
  };
  /** Callback when vote button is clicked */
  onVote?: (commentId: string, voteType: 1 | -1) => void;
  /** Callback when delete button is clicked */
  onDelete?: (commentId: string) => void;
  /** Current user ID for permission check */
  currentUserId?: string;
}

/**
 * * Renders a comment thread with the given properties.
 *  *
 *  * @param {CommentThreadProps} props - The properties of the comment thread.
 *  * @param {Object} props.comment - The comment to render.
 *  * @param {Object} props.author - The author of the comment.
 *  * @param {Function} [props.onVote] - A callback function for handling like and dislike votes.
 *  * @param {Function} [props.onDelete] - A callback function for deleting a comment.
 *  * @param {Number} props.currentUserId - The ID of the current user.
 *  * @param {String} props.className - Additional CSS class names to apply.
 *  *
 *  * @returns {JSX.Element} The rendered comment thread.
 */
export function CommentThread({
  comment,
  author,
  onVote,
  onDelete,
  currentUserId,
  className,
  ...props
}: CommentThreadProps) {
  const canDelete = currentUserId && currentUserId === author.id;
  return (
    <div className={cn("flex gap-4", className)} {...props}>
      <div className="shrink-0">
        <Link href={`/users/${author.username}`}>
          <UserAvatar src={author.avatarUrl} alt={author.name} size="lg" />
        </Link>
      </div>
      <div className="flex-1 pb-6 border-b border-neutral-800">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-1">
          <Link
            href={`/users/${author.username}`}
            className="font-bold text-neutral-200 text-sm hover:text-white transition-colors"
          >
            {author.username}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">{comment.timestamp}</span>
            {canDelete && (
              <button
                onClick={() => onDelete?.(comment.id)}
                className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete comment"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-neutral-300 text-sm leading-relaxed mb-3 break-all overflow-hidden">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          {/* Like Button */}
          <button
            onClick={() => onVote?.(comment.id, 1)}
            className={cn(
              "flex items-center gap-1 transition-colors hover:text-green-500 cursor-pointer",
              comment.userVote === 1 ? "text-green-500" : ""
            )}
          >
            <ThumbsUp size={14} fill={comment.userVote === 1 ? "currentColor" : "none"} />
            <span>{comment.likes}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={() => onVote?.(comment.id, -1)}
            className={cn(
              "flex items-center gap-1 transition-colors hover:text-red-500 cursor-pointer",
              comment.userVote === -1 ? "text-red-500" : ""
            )}
          >
            <ThumbsDown size={14} fill={comment.userVote === -1 ? "currentColor" : "none"} />
            <span>{comment.dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

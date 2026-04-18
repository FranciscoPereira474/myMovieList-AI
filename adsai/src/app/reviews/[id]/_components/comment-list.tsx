"use client";

import { CommentThread } from "@/components/ui/comment-thread";
import { toggleCommentVote } from "@/app/actions/comment-votes";
import { deleteComment } from "@/app/actions/review-management";
import { Comment } from "../_lib/queries";
import { timeAgo } from "@/lib/time-utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CommentListProps {
  initialComments: Comment[];
  currentUserId?: string;
  reviewId: string;
}

/**
 * * Renders a list of comments for a review.
 *  *
 *  * @param {CommentListProps} props - The component's props.
 *  * @returns {JSX.Element} The rendered comment list.
 *  
 * export function CommentList({ initialComments, currentUserId, reviewId }: CommentListProps) {
 *   const [comments, setComments] = useState(initialComments);
 *   const [isDeleting, setIsDeleting] = useState<string | null>(null);
 *   const router = useRouter();
 *
 *   // Sync state with props when they change (e.g. after router.refresh())
 *   useEffect(() => {
 *     setComments(initialComments);
 *   }, [initialComments]);
 *
 *   
 *    * Handles a comment vote.
 *    *
 *    * @param {string} commentId - The ID of the comment to vote on.
 *    * @param {1 | -1} voteType - The type of vote (1 for upvote, -1 for downvote).
 *    
 *   const handleVote = async (commentId: string, voteType: 1 | -1) => {
 *     if (!currentUserId) {
 *       const redirect = encodeURIComponent(`/reviews/${reviewId}`);
 *       router.push(`/login?redirect=${redirect}`);
 *       return;
 *     }
 *
 *     // Optimistic update
 *     setComments((prev) =>
 *       prev.map((c) => {
 *         if (c.id === commentId) {
 *           const isRemovingVote = c.userVote === voteType;
 *           const newVote = isRemovingVote ? null : voteType;
 *           
 *           let newLikes = c.likes_count;
 *           let newDislikes = c.dislikes_count;
 *
 *           // Remove old vote counts
 *           if (c.userVote === 1) newLikes = Math.max(0, newLikes - 1);
 *           if (c.userVote === -1) newDislikes = Math.max(0, newDislikes - 1);
 *
 *           // Add new vote counts
 *           if (newVote === 1) newLikes++;
 *           if (newVote === -1) newDislikes++;
 *
 *           return {
 *             ...c,
 *             userVote: newVote,
 *             likes_count: newLikes,
 *             dislikes_count: newDislikes,
 *           };
 *         }
 *         return c;
 *       })
 *     );
 *
 *     try {
 *       await toggleCommentVote(commentId, currentUserId, voteType);
 *       router.refresh(); 
 *     } catch (error) {
 *       console.error("Failed to vote", error);
 *       // Revert on error could be added here
 *     }
 *   };
 *
 *   
 *    * Handles a comment deletion.
 *    *
 *    * @param {string} commentId - The ID of the comment to delete.
 *    
 *   const handleDelete = async (commentId: string) => {
 *     if (!currentUserId) {
 *       const redirect = encodeURIComponent(`/reviews/${reviewId}`);
 *       router.push(`/login?redirect=${redirect}`);
 *       return;
 *     }
 *
 *     if (!confirm("Are you sure you want to delete this comment?")) {
 *       return;
 *     }
 *
 *     setIsDeleting(commentId);
 *
 *     try {
 *       const result = await deleteComment(commentId, reviewId);
 *       if (result.success) {
 *         // Optimistically remove from UI
 *         setComments((prev) => prev.filter((c) => c.id !== commentId));
 *         router.refresh();
 *       } else {
 *         alert(result.error || "Failed to delete comment");
 *       }
 *     } catch (error) {
 *       console.error("Failed to delete comment", error);
 *       alert("An error occurred while deleting the comment");
 *     } finally {
 *       setIsDeleting(null);
 *     }
 *   };
 *
 *   return (
 *     <div className="space-y-6">
 *       {comments.map((comment) => (
 *         <CommentThread
 *           key={comment.id}
 *           comment={{
 *             id: comment.id,
 *             content: comment.content,
 *             timestamp: timeAgo(comment.created_at),
 *             likes: comment.likes_count,
 *             dislikes: comment.dislikes_count,
 *             userVote: comment.userVote,
 *           }}
 *           author={{
 *             id: comment.user.id,
 *             name: comment.user.username,
 *             username: comment.user.username,
 *             avatarUrl: comment.user.avatar_url || undefined,
 *           }}
 *           onVote={handleVote}
 *           onDelete={handleDelete}
 *           currentUserId={currentUserId}
 *         />
 *       ))}
 *       {comments.length === 0 && (
 *         <p className="text-neutral-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
 *       )}
 *     </div>
 *   );
 * }
 */
export function CommentList({ initialComments, currentUserId, reviewId }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  // Sync state with props when they change (e.g. after router.refresh())
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleVote = async (commentId: string, voteType: 1 | -1) => {
    if (!currentUserId) {
      const redirect = encodeURIComponent(`/reviews/${reviewId}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isRemovingVote = c.userVote === voteType;
          const newVote = isRemovingVote ? null : voteType;
          
          let newLikes = c.likes_count;
          let newDislikes = c.dislikes_count;

          // Remove old vote counts
          if (c.userVote === 1) newLikes = Math.max(0, newLikes - 1);
          if (c.userVote === -1) newDislikes = Math.max(0, newDislikes - 1);

          // Add new vote counts
          if (newVote === 1) newLikes++;
          if (newVote === -1) newDislikes++;

          return {
            ...c,
            userVote: newVote,
            likes_count: newLikes,
            dislikes_count: newDislikes,
          };
        }
        return c;
      })
    );

    try {
      await toggleCommentVote(commentId, currentUserId, voteType);
      router.refresh(); 
    } catch (error) {
      console.error("Failed to vote", error);
      // Revert on error could be added here
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUserId) {
      const redirect = encodeURIComponent(`/reviews/${reviewId}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(commentId);

    try {
      const result = await deleteComment(commentId, reviewId);
      if (result.success) {
        // Optimistically remove from UI
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        router.refresh();
      } else {
        alert(result.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
      alert("An error occurred while deleting the comment");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={{
            id: comment.id,
            content: comment.content,
            timestamp: timeAgo(comment.created_at),
            likes: comment.likes_count,
            dislikes: comment.dislikes_count,
            userVote: comment.userVote,
          }}
          author={{
            id: comment.user.id,
            name: comment.user.username,
            username: comment.user.username,
            avatarUrl: comment.user.avatar_url || undefined,
          }}
          onVote={handleVote}
          onDelete={handleDelete}
          currentUserId={currentUserId}
        />
      ))}
      {comments.length === 0 && (
        <p className="text-neutral-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
}

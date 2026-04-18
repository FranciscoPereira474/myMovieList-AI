"use client";

import { CommentForm } from "@/components/ui/comment-form";
import { postComment } from "@/app/actions/review-comments";
import { useState } from "react";

interface ReviewCommentFormProps {
  reviewId: string;
  userAvatarUrl?: string;
  userName?: string;
}

/**
 * * Creates and renders the ReviewCommentForm component.
 *  *
 *  * @param {ReviewCommentFormProps} props - The properties for the ReviewCommentForm component.
 *  * @returns {JSX.Element} The rendered ReviewCommentForm component.
 *  
 * export function ReviewCommentForm({ reviewId, userAvatarUrl, userName }: ReviewCommentFormProps) {
 *   const [isLoading, setIsLoading] = useState(false);
 *
 *   
 *    * Handles the form submission by posting a comment to the specified review ID.
 *    *
 *    * @param {string} content - The text content of the comment to be posted.
 *    
 *   const handleSubmit = async (content: string) => {
 *     setIsLoading(true);
 *     try {
 *       const result = await postComment(reviewId, content);
 *       if (!result.success) {
 *         console.error(result.error);
 *         // Ideally show a toast notification here
 *       }
 *     } catch (error) {
 *       console.error(error);
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <CommentForm
 *       userAvatarUrl={userAvatarUrl}
 *       userName={userName}
 *       onSubmit={handleSubmit}
 *       isLoading={isLoading}
 *       submitText="Post Comment"
 *       placeholder="Add a comment..."
 *     />
 *   );
 * }
 */
export function ReviewCommentForm({ reviewId, userAvatarUrl, userName }: ReviewCommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (content: string) => {
    setIsLoading(true);
    try {
      const result = await postComment(reviewId, content);
      if (!result.success) {
        console.error(result.error);
        // Ideally show a toast notification here
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CommentForm
      userAvatarUrl={userAvatarUrl}
      userName={userName}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText="Post Comment"
      placeholder="Add a comment..."
    />
  );
}

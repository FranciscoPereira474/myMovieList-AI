"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Delete a review (only by the author)
 * @param reviewId - UUID of the review to delete
 */
export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[deleteReview] Auth error:", authError);
      return { success: false, error: "You must be logged in to delete reviews" };
    }

    // Verify ownership - fetch the review first
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id, movie_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !review) {
      console.error("[deleteReview] Fetch error:", fetchError);
      return { success: false, error: "Review not found" };
    }

    // Check if current user is the author
    if (review.user_id !== user.id) {
      return { success: false, error: "You can only delete your own reviews" };
    }

    // Delete the review (this will cascade delete comments and votes due to DB constraints)
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id); // Double check ownership in query

    if (deleteError) {
      console.error("[deleteReview] Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Revalidate the movie page
    revalidatePath(`/movies/${review.movie_id}`);
    revalidatePath(`/reviews/${reviewId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteReview] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a comment (only by the author)
 * @param commentId - UUID of the comment to delete
 * @param reviewId - UUID of the parent review (for revalidation)
 */
export async function deleteComment(commentId: string, reviewId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[deleteComment] Auth error:", authError);
      return { success: false, error: "You must be logged in to delete comments" };
    }

    // Verify ownership - fetch the comment first
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      console.error("[deleteComment] Fetch error:", fetchError);
      return { success: false, error: "Comment not found" };
    }

    // Check if current user is the author
    if (comment.user_id !== user.id) {
      return { success: false, error: "You can only delete your own comments" };
    }

    // Delete the comment (this will cascade delete comment votes due to DB constraints)
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id); // Double check ownership in query

    if (deleteError) {
      console.error("[deleteComment] Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Revalidate the review page
    revalidatePath(`/reviews/${reviewId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteComment] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

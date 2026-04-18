"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { sanitizeUserContent } from "@/lib/bad-words";

// =============================================================================
// Response Types
// =============================================================================

interface ActionResult {
  success: boolean;
  error?: string;
}

// =============================================================================
// Rating Actions
// =============================================================================

/**
 * Upsert a rating for a movie (creates or updates)
 * @param movieId - UUID of the movie
 * @param score - Rating score (1-10 scale)
 */
export async function rateMovie(
  movieId: string,
  score: number
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[rateMovie] Auth error:", authError);
      return { success: false, error: "You must be logged in to rate movies" };
    }

    // Validate score
    if (score < 1 || score > 10 || !Number.isInteger(score)) {
      return { success: false, error: "Rating must be an integer between 1 and 10" };
    }

    // Upsert rating (insert or update on conflict)
    const { error: insertError } = await supabase
      .from("ratings")
      .upsert(
        {
          user_id: user.id,
          movie_id: movieId,
          score: score,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,movie_id",
        }
      );

    if (insertError) {
      console.error("[rateMovie] Insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    // Revalidate the movie page to show updated rating
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[rateMovie] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Remove a rating for a movie
 * @param movieId - UUID of the movie
 */
export async function removeRating(movieId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[removeRating] Auth error:", authError);
      return { success: false, error: "You must be logged in to remove ratings" };
    }

    // Delete the rating
    const { error: deleteError } = await supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_id", movieId);

    if (deleteError) {
      console.error("[removeRating] Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Revalidate the movie page
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[removeRating] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================================================================
// Watchlist Actions
// =============================================================================

/**
 * Add a movie to the user's watchlist
 * @param movieId - UUID of the movie
 */
export async function addToWatchlist(movieId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[addToWatchlist] Auth error:", authError);
      return { success: false, error: "You must be logged in to add to watchlist" };
    }

    // Insert into watchlist
    const { error: insertError } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        movie_id: movieId,
      });

    if (insertError) {
      // Handle duplicate entry gracefully
      if (insertError.code === "23505") {
        return { success: true }; // Already in watchlist, treat as success
      }
      console.error("[addToWatchlist] Insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    // Revalidate the movie page
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[addToWatchlist] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Remove a movie from the user's watchlist
 * @param movieId - UUID of the movie
 */
export async function removeFromWatchlist(movieId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[removeFromWatchlist] Auth error:", authError);
      return { success: false, error: "You must be logged in to modify watchlist" };
    }

    // Delete from watchlist
    const { error: deleteError } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_id", movieId);

    if (deleteError) {
      console.error("[removeFromWatchlist] Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Revalidate the movie page
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[removeFromWatchlist] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================================================================
// Review Actions
// =============================================================================

/**
 * Review submission data
 * Based on `reviews` table schema:
 * - title: text (optional)
 * - body: text (required)
 * - contains_spoilers: boolean (default false)
 * - watched_date: date (optional)
 */
export interface ReviewFormData {
  title?: string;
  body: string;
  containsSpoilers?: boolean;
  watchedDate?: string; // ISO date string
}

/**
 * Create a new review for a movie
 * @param movieId - UUID of the movie
 * @param data - Review form data
 */
export async function createReview(
  movieId: string,
  data: ReviewFormData
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[createReview] Auth error:", authError);
      return { success: false, error: "You must be logged in to write a review" };
    }

    // Validate body
    if (!data.body || data.body.trim().length === 0) {
      return { success: false, error: "Review body cannot be empty" };
    }

    if (data.body.length > 10000) {
      return { success: false, error: "Review body is too long (max 10,000 characters)" };
    }

    // Validate title if provided
    if (data.title && data.title.length > 200) {
      return { success: false, error: "Review title is too long (max 200 characters)" };
    }

    // Sanitize content for bad words
    const sanitizedTitle = data.title?.trim() ? await sanitizeUserContent(data.title.trim()) : null;
    const sanitizedBody = await sanitizeUserContent(data.body.trim());

    // Insert review
    const { error: insertError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        movie_id: movieId,
        title: sanitizedTitle,
        body: sanitizedBody,
        contains_spoilers: data.containsSpoilers ?? false,
        watched_date: data.watchedDate || null,
      });

    if (insertError) {
      console.error("[createReview] Insert error:", insertError);
      
      // Handle duplicate review
      if (insertError.code === "23505") {
        return { success: false, error: "You have already reviewed this movie" };
      }
      
      return { success: false, error: insertError.message };
    }

    // Revalidate the movie page to show new review
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[createReview] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// =============================================================================
// Review Vote Actions
// =============================================================================

/**
 * Vote result with updated counts
 */
interface VoteResult extends ActionResult {
  upvotes?: number;
  downvotes?: number;
  userVote?: "up" | "down" | null;
}

/**
 * Vote on a review (upvote or downvote)
 * Schema: `review_votes` table with `is_upvote` boolean
 * - Clicking same vote type removes the vote
 * - Clicking different vote type switches the vote
 * 
 * @param reviewId - UUID of the review
 * @param voteType - "up" or "down"
 */
export async function voteOnReview(
  reviewId: string,
  voteType: "up" | "down"
): Promise<VoteResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[voteOnReview] Auth error:", authError);
      return { success: false, error: "You must be logged in to vote" };
    }

    const isUpvote = voteType === "up";

    // Check if user already has a vote on this review
    const { data: existingVote, error: fetchError } = await supabase
      .from("review_votes")
      .select("is_upvote")
      .eq("user_id", user.id)
      .eq("review_id", reviewId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found (expected if no vote exists)
      console.error("[voteOnReview] Fetch error:", fetchError);
      return { success: false, error: fetchError.message };
    }

    let newUserVote: "up" | "down" | null = null;

    if (existingVote) {
      // User has an existing vote
      if (existingVote.is_upvote === isUpvote) {
        // Same vote type - remove the vote (toggle off)
        const { error: deleteError } = await supabase
          .from("review_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("review_id", reviewId);

        if (deleteError) {
          console.error("[voteOnReview] Delete error:", deleteError);
          return { success: false, error: deleteError.message };
        }
        newUserVote = null;
      } else {
        // Different vote type - update the vote
        const { error: updateError } = await supabase
          .from("review_votes")
          .update({ is_upvote: isUpvote })
          .eq("user_id", user.id)
          .eq("review_id", reviewId);

        if (updateError) {
          console.error("[voteOnReview] Update error:", updateError);
          return { success: false, error: updateError.message };
        }
        newUserVote = voteType;
      }
    } else {
      // No existing vote - create new vote
      const { error: insertError } = await supabase
        .from("review_votes")
        .insert({
          user_id: user.id,
          review_id: reviewId,
          is_upvote: isUpvote,
        });

      if (insertError) {
        console.error("[voteOnReview] Insert error:", insertError);
        return { success: false, error: insertError.message };
      }
      newUserVote = voteType;
    }

    // Fetch updated vote counts
    const [{ count: upvotes }, { count: downvotes }] = await Promise.all([
      supabase
        .from("review_votes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId)
        .eq("is_upvote", true),
      supabase
        .from("review_votes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId)
        .eq("is_upvote", false),
    ]);

    return {
      success: true,
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
      userVote: newUserVote,
    };
  } catch (error) {
    console.error("[voteOnReview] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a review
 * Only the author of the review can delete it.
 * Double-checks ownership in the query for safety.
 * 
 * @param reviewId - UUID of the review to delete
 * @param movieId - UUID of the movie (for path revalidation)
 */
export async function deleteReview(
  reviewId: string,
  movieId: string
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[deleteReview] Auth error:", authError);
      return { success: false, error: "You must be logged in to delete a review" };
    }

    // Delete the review - ownership check is done in the query (user_id = user.id)
    // This ensures even if RLS fails, the query only deletes the user's own review
    const { error: deleteError, count } = await supabase
      .from("reviews")
      .delete({ count: "exact" })
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[deleteReview] Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Check if any row was actually deleted
    if (count === 0) {
      return { success: false, error: "Review not found or you don't have permission to delete it" };
    }

    // Revalidate the movie page to remove the review from the list
    revalidatePath(`/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteReview] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

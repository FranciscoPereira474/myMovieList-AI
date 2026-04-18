"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export interface VoteResult {
  success: boolean;
  error?: string;
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

    // Get current user using getUser() (secure method)
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

    // Revalidate paths that might show this review
    revalidatePath("/");

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

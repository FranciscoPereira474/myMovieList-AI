"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export interface CommentVoteResult {
  success: boolean;
  error?: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: "up" | "down" | null;
}

/**
 * Vote on a comment (upvote or downvote)
 * Schema: `comment_votes` table with `vote_type` integer (1 = like, -1 = dislike)
 * - Clicking same vote type removes the vote
 * - Clicking different vote type switches the vote
 *
 * @param commentId - UUID of the comment
 * @param voteType - "up" or "down"
 */
export async function voteOnComment(
  commentId: string,
  voteType: "up" | "down"
): Promise<CommentVoteResult> {
  try {
    const supabase = await createServerClient();

    // Get current user using getUser() (secure method)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[voteOnComment] Auth error:", authError);
      return { success: false, error: "You must be logged in to vote" };
    }

    const voteValue = voteType === "up" ? 1 : -1;

    // Check if user already has a vote on this comment
    const { data: existingVote, error: fetchError } = await supabase
      .from("comment_votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq("comment_id", commentId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found (expected if no vote exists)
      console.error("[voteOnComment] Fetch error:", fetchError);
      return { success: false, error: fetchError.message };
    }

    let newUserVote: "up" | "down" | null = null;

    if (existingVote) {
      // User has an existing vote
      if (existingVote.vote_type === voteValue) {
        // Same vote type - remove the vote (toggle off)
        const { error: deleteError } = await supabase
          .from("comment_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);

        if (deleteError) {
          console.error("[voteOnComment] Delete error:", deleteError);
          return { success: false, error: deleteError.message };
        }
        newUserVote = null;
      } else {
        // Different vote type - update the vote
        const { error: updateError } = await supabase
          .from("comment_votes")
          .update({ vote_type: voteValue })
          .eq("user_id", user.id)
          .eq("comment_id", commentId);

        if (updateError) {
          console.error("[voteOnComment] Update error:", updateError);
          return { success: false, error: updateError.message };
        }
        newUserVote = voteType;
      }
    } else {
      // No existing vote - create new vote
      const { error: insertError } = await supabase
        .from("comment_votes")
        .insert({
          user_id: user.id,
          comment_id: commentId,
          vote_type: voteValue,
        });

      if (insertError) {
        console.error("[voteOnComment] Insert error:", insertError);
        return { success: false, error: insertError.message };
      }
      newUserVote = voteType;
    }

    // Fetch updated vote counts
    const [{ count: upvotes }, { count: downvotes }] = await Promise.all([
      supabase
        .from("comment_votes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("vote_type", 1),
      supabase
        .from("comment_votes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("vote_type", -1),
    ]);

    // Revalidate paths that might show this comment
    revalidatePath("/");

    return {
      success: true,
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
      userVote: newUserVote,
    };
  } catch (error) {
    console.error("[voteOnComment] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get vote counts and user's vote for a comment
 */
export async function getCommentVotes(commentId: string): Promise<{
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
}> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch vote counts
    const [{ count: upvotes }, { count: downvotes }] = await Promise.all([
      supabase
        .from("comment_votes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("vote_type", 1),
      supabase
        .from("comment_votes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("vote_type", -1),
    ]);

    // Fetch user's vote if logged in
    let userVote: "up" | "down" | null = null;
    if (user) {
      const { data: voteData } = await supabase
        .from("comment_votes")
        .select("vote_type")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single();

      if (voteData) {
        userVote = voteData.vote_type === 1 ? "up" : "down";
      }
    }

    return {
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
      userVote,
    };
  } catch (error) {
    console.error("[getCommentVotes] Error:", error);
    return { upvotes: 0, downvotes: 0, userVote: null };
  }
}

/**
 * Toggles a vote on a comment.
 * 
 * Logic:
 * - If the user has not voted: Insert the new vote.
 * - If the user has already voted with the SAME type: Remove the vote (toggle off).
 * - If the user has already voted with a DIFFERENT type: Update the vote to the new type.
 * 
 * @param commentId The ID of the comment.
 * @param userId The ID of the user voting.
 * @param voteType 1 for Like, -1 for Dislike.
 */
export async function toggleCommentVote(commentId: string, userId: string, voteType: 1 | -1) {
  const supabase = await createServerClient();

  // 1. Check if a vote already exists
  const { data: existingVote, error: fetchError } = await supabase
    .from('comment_votes')
    .select('vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching existing vote:', fetchError);
    throw fetchError;
  }

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Case: User clicked the same vote again -> Remove it (Toggle Off)
      const { error: deleteError } = await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;
    } else {
      // Case: User clicked a different vote -> Update it (Switch)
      const { error: updateError } = await supabase
        .from('comment_votes')
        .update({ vote_type: voteType })
        .eq('comment_id', commentId)
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
    }
  } else {
    // Case: No vote exists -> Insert new vote
    const { error: insertError } = await supabase
      .from('comment_votes')
      .insert({ comment_id: commentId, user_id: userId, vote_type: voteType });

    if (insertError) throw insertError;
  }

  // Revalidate the page to reflect changes
  // We don't know the exact path here easily without passing it, 
  // but usually we might want to revalidate the review page.
  // For now, we rely on the client-side optimistic update or router.refresh() called in the component.
}

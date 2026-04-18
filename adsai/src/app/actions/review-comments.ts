"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { sanitizeUserContent } from "@/lib/bad-words";

/**
 * * Posts a new comment for the specified review.
 *  *
 *  * @param {string} reviewId - The ID of the review to post the comment for.
 *  * @param {string} content - The text content of the comment to post.
 *  *
 *  * @returns {{ success: boolean, error: string }} An object indicating whether the comment was posted successfully and any associated error message.
 */
export async function postComment(reviewId: string, content: string) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Sanitize content for bad words
  const sanitizedContent = await sanitizeUserContent(content);

  const { error } = await supabase
    .from("comments")
    .insert({
      review_id: reviewId,
      user_id: user.id,
      body: sanitizedContent,
    });

  if (error) {
    console.error("Error posting comment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/reviews/${reviewId}`);
  return { success: true };
}

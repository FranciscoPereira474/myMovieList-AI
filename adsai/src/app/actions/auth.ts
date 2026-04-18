"use server";

import { checkBadWords } from "@/lib/bad-words";
import { createServerClient } from "@/lib/supabase/server-client";

export interface ValidateUsernameResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate username for registration (check bad words only)
 * This is called before the actual registration to validate the username
 */
export async function validateUsernameForRegistration(
  username: string
): Promise<ValidateUsernameResult> {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: "Username is required" };
  }

  const trimmedUsername = username.trim();

  // Basic validation
  if (trimmedUsername.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }

  if (trimmedUsername.length > 20) {
    return { valid: false, error: "Username must be at most 20 characters" };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  // Check for bad words (strict blocking)
  const badWordsCheck = await checkBadWords(trimmedUsername);
  if (badWordsCheck.hasBadWords) {
    return {
      valid: false,
      error: "Username contains inappropriate language",
    };
  }

  // Check uniqueness in the `profiles` table (server-side)
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", trimmedUsername)
      .limit(1);

    if (error) {
      // Don't block the user with an internal DB error, but log and return a generic error
      console.error("Error checking username uniqueness:", error);
      return { valid: false, error: "Unable to validate username right now" };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      return { valid: false, error: "Username is already in use" };
    }
  } catch (e) {
    console.error("Unexpected error validating username uniqueness:", e);
    return { valid: false, error: "Unable to validate username right now" };
  }

  return { valid: true };
}

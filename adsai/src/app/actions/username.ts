"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { usernameSchema } from "./schemas";
import { checkBadWords } from "@/lib/bad-words";

export interface UpdateUsernameResult {
  success: boolean;
  error?: string;
  fieldError?: string; // For form field-specific errors
}

/**
 * Check if a username is already taken
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { available: false, error: "You must be logged in" };
    }

    // Check if username exists (excluding current user's username)
    const { data: existingProfile, error: queryError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .neq("id", user.id)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 = no rows found (which means username is available)
      return { available: false, error: queryError.message };
    }

    return { available: !existingProfile };
  } catch (error) {
    console.error("[checkUsernameAvailability] Error:", error);
    return { available: false, error: "Failed to check username availability" };
  }
}

/**
 * Update the user's username and mark it as permanent (not temp)
 */
export async function updateUsername(
  formData: FormData
): Promise<UpdateUsernameResult> {
  const rawUsername = formData.get("username");

  // Validate input exists
  if (!rawUsername || typeof rawUsername !== "string") {
    return { success: false, fieldError: "Username is required" };
  }

  const username = rawUsername.trim().toLowerCase();

  // Validate with Zod
  const validation = usernameSchema.safeParse(username);
  if (!validation.success) {
    return {
      success: false,
      fieldError: validation.error.issues[0]?.message || "Invalid username",
    };
  }

  // Check for bad words (strict blocking)
  const badWordsCheck = await checkBadWords(username);
  if (badWordsCheck.hasBadWords) {
    return {
      success: false,
      fieldError: "Username contains inappropriate language",
    };
  }

  try {
    const supabase = await createServerClient();

    // Get current user securely
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to update your username" };
    }

    // Check if username is already taken by another user
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[updateUsername] Check error:", checkError);
      return { success: false, error: "Failed to verify username availability" };
    }

    if (existingProfile) {
      return { success: false, fieldError: "This username is already taken" };
    }

    // Update the username and set username_is_temp to false
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username,
        username_is_temp: false,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[updateUsername] Update error:", updateError);
      
      // Handle unique constraint violation (race condition)
      if (updateError.code === "23505") {
        return { success: false, fieldError: "This username is already taken" };
      }
      
      return { success: false, error: "Failed to update username" };
    }

    // Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/onboarding/claim-username");

    return { success: true };
  } catch (error) {
    console.error("[updateUsername] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

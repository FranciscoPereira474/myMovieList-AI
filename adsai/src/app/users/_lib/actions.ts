"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

async function idToUsername(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("profiles").select("username").eq("id", id).single();
  if (error || !data) return null;
  return data.username as string;
}

/**
 * Follow a user
 * Creates a new follow relationship in the database
 *
 * Database logic:
 * - follower_id = current user (the one doing the following)
 * - following_id = target user (the one being followed)
 */
export async function followUser(targetUserId: string) {
  const supabase = await createServerClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (user.id === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  // Check if already following
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id, following_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  // If already following, just return success (idempotent)
  if (existing) {
    await revalidateFollowPaths(targetUserId, user.id);
    return { success: true, alreadyFollowing: true };
  }

  // Insert follow relationship
  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    console.error("Error following user:", error);
    // If it's a duplicate key error, treat as success (race condition)
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      revalidateFollowPaths(targetUserId, user.id);
      return { success: true, alreadyFollowing: true };
    }
    throw new Error("Failed to follow user");
  }

  await revalidateFollowPaths(targetUserId, user.id);
  return { success: true, alreadyFollowing: false };
}

/**
 * Unfollow a user
 * Removes the follow relationship from the database
 *
 * Database logic:
 * - Deletes row where follower_id = current user AND following_id = target user
 */
export async function unfollowUser(targetUserId: string) {
  const supabase = await createServerClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Delete follow relationship
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) {
    console.error("Error unfollowing user:", error);
    throw new Error("Failed to unfollow user");
  }

  await revalidateFollowPaths(targetUserId, user.id);
  return { success: true };
}

/**
 * Helper to revalidate all paths affected by follow/unfollow actions
 */
async function revalidateFollowPaths(targetUserId: string, currentUserId: string) {
  // Revalidate users directory
  revalidatePath("/users");

  // Resolve usernames for both ids (if possible) and revalidate username-based paths.
  const targetUsername = await idToUsername(targetUserId);
  const currentUsername = await idToUsername(currentUserId);

  if (targetUsername) {
    revalidatePath(`/users/${targetUsername}`);
    revalidatePath(`/users/${targetUsername}/followers`);
    revalidatePath(`/users/${targetUsername}/following`);
  }

  if (currentUsername) {
    revalidatePath(`/users/${currentUsername}`);
    revalidatePath(`/users/${currentUsername}/followers`);
    revalidatePath(`/users/${currentUsername}/following`);
  }
}

/**
 * Update user bio
 * Updates the bio field in the user's profile
 */
export async function updateBio(bio: string) {
  const supabase = await createServerClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate bio length
  if (bio.length > 500) {
    throw new Error("Bio must be 500 characters or less");
  }

  // Update bio
  const { error } = await supabase
    .from("profiles")
    .update({ bio: bio.trim() || null })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating bio:", error);
    throw new Error("Failed to update bio");
  }

  // Revalidate the user page to show updated bio (by username)
  const username = await idToUsername(user.id);
  if (username) revalidatePath(`/users/${username}`);
}

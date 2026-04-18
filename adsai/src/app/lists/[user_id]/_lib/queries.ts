/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server-client";
import { createServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { ListWithDetails } from "../../_lib/queries";

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

/**
 * Fetch user profile by username
 */
export async function getUserById(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await createServerClient();

  // Try matching by id first
  let { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (!data) {
    // Fallback: maybe the route param is a username string — try username
    const resp = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio")
      .eq("username", userId)
      .single();
    data = resp.data;
    error = resp.error;
  }

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Fetch lists created by a user
 */
export async function getUserCreatedLists(
  userId: string,
  limit: number = 12,
  offset: number = 0,
  includePrivate: boolean = false
): Promise<{ lists: ListWithDetails[]; hasMore: boolean }> {
  const supabase = await createServerClient();

  // Build query and optionally include private lists when requested
  let query: any = supabase
    .from("lists")
    .select("id, name, description, user_id, created_at, is_public")
    .eq("user_id", userId);

  if (!includePrivate) {
    query = query.eq("is_public", true);
  }

  const { data: lists, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error || !lists) {
    console.error("Error fetching user created lists:", error);
    return { lists: [], hasMore: false };
  }

  const enrichedLists = await enrichLists(lists, supabase);
  const hasMore = enrichedLists.length > limit;

  return {
    lists: enrichedLists.slice(0, limit),
    hasMore,
  };
}

/**
 * Fetch lists saved by a user
 */
export async function getUserSavedLists(
  userId: string,
  limit: number = 12,
  offset: number = 0
): Promise<{ lists: ListWithDetails[]; hasMore: boolean }> {
  // Use service role client to bypass RLS so any user can view another user's saved lists
  const supabase = createServiceRoleClient();

  // First get the list IDs from list_saves
  const { data: savedListRefs, error: savedError } = await supabase
    .from("list_saves")
    .select("list_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (savedError || !savedListRefs || savedListRefs.length === 0) {
    return { lists: [], hasMore: false };
  }

  const listIds = savedListRefs.map((s) => s.list_id);

  // Fetch the actual lists
  const { data: lists, error } = await supabase
    .from("lists")
    .select("id, name, description, user_id, created_at, is_public")
    .in("id", listIds)
    .eq("is_public", true);

  if (error || !lists) {
    console.error("Error fetching saved lists:", error);
    return { lists: [], hasMore: false };
  }

  // Maintain saved order
  const orderedLists = listIds
    .map((id) => lists.find((l) => l.id === id))
    .filter(Boolean) as typeof lists;

  const enrichedLists = await enrichLists(orderedLists, supabase);
  const hasMore = savedListRefs.length > limit;

  return {
    lists: enrichedLists.slice(0, limit),
    hasMore,
  };
}

/**
 * Enrich lists with user info, posters, and counts
 */
async function enrichLists(
  lists: Array<{
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    created_at: string;
  }>,
  supabase: SupabaseClient
): Promise<ListWithDetails[]> {
  return Promise.all(
    lists.map(async (list) => {
      // Get user info
      const { data: user } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", list.user_id)
        .single();

      // Get list items with movie posters (first 3)
      const { data: listItems } = await supabase
        .from("list_items")
        .select(`movie_id, movies (id, slug, poster_url)`)
        .eq("list_id", list.id)
        .limit(3);

      const moviePosters =
        listItems
          ?.map((item) => {
            const movies = item.movies as unknown as { poster_url?: string | null; slug?: string | null } | null;
            return { poster_url: movies?.poster_url ?? null, slug: movies?.slug ?? null };
          })
          .filter(Boolean) || [];

      // Get save count
      const { count: saveCount } = await supabase
        .from("list_saves")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      // Get item count
      const { count: itemCount } = await supabase
        .from("list_items")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        is_public: (list as any).is_public ?? true,
        user: user || { id: "", username: "Unknown", avatar_url: null },
        movie_posters: moviePosters as { poster_url?: string | null; slug?: string | null }[],
        save_count: saveCount || 0,
        item_count: itemCount || 0,
      };
    })
  );
}

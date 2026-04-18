/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";

export type ListSortOption = "popular_week" | "newest" | "most_saved";

export interface ListWithDetails {
  id: string;
  name: string;
  description: string | null;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  // Each poster may include the movie slug so UI can link to the movie page
  movie_posters: { poster_url?: string | null; slug?: string | null }[];
  save_count: number;
  item_count: number;
  is_public: boolean;
  saved_by_me?: boolean;
}

/**
 * Fetch public lists with sorting options
 */
export async function getLists(
  limit: number = 12,
  offset: number = 0,
  sort: ListSortOption = "popular_week"
): Promise<{ lists: ListWithDetails[]; hasMore: boolean }> {
  const supabase = await createServerClient();

  // Attempt to detect current user so we can mark lists saved by them
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Base query for public lists
  let query = supabase
    .from("lists")
    .select(`
      id,
      name,
      description,
      user_id,
      created_at,
      is_public
    `)
    .eq("is_public", true);

  // Apply sorting
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // For popular_week and most_saved, we'll sort after fetching
    query = query.order("created_at", { ascending: false });
  }

  // Fetch one extra to check if there are more
  const { data: lists, error } = await query.range(offset, offset + limit);

  if (error || !lists) {
    console.error("Error fetching lists:", error);
    return { lists: [], hasMore: false };
  }

  // Enrich with user, posters, counts and whether current user saved the list
  const enrichedLists = await Promise.all(
    lists.map(async (list) => {
      // Get user info
      const { data: user } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", list.user_id)
        .single();

      // Get list items with movie posters (only first 3)
      const { data: listItems } = await supabase
        .from("list_items")
        .select(`
          movie_id,
          movies (id, slug, poster_url)
        `)
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

      // Check if current user saved this list
      let savedByMe = false;
      if (authUser) {
        const { count: savedCountByUser } = await supabase
          .from("list_saves")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("user_id", authUser.id);
        savedByMe = (savedCountByUser || 0) > 0;
      }

      // For popular_week, count saves and comments from last 7 days and compute week popularity
      let weekSaveCount = 0;
      let weekCommentsCount = 0;
      if (sort === "popular_week") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sinceISO = sevenDaysAgo.toISOString();

        const [{ count: savesCount }, { count: commentsCount, error: commentsErr }] = await Promise.all([
          supabase
            .from("list_saves")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id)
            .gte("created_at", sinceISO),
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id)
            .gte("created_at", sinceISO),
        ]);

        weekSaveCount = savesCount || 0;
        weekCommentsCount = commentsCount || 0;
        if (commentsErr) {
          // don't fail the whole page for comments counting issues; log and continue
          console.warn("Error counting recent comments for list", list.id, commentsErr);
        }
      }

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
        saved_by_me: savedByMe,
        _week_save_count: weekSaveCount,
        _week_comments_count: weekCommentsCount,
        _week_popularity: (weekSaveCount || 0) + (weekCommentsCount || 0),
      };
    })
  );

  // Apply sorting based on sort option
  let sortedLists = enrichedLists;
  if (sort === "popular_week") {
    // sort by combined week popularity (saves + comments) — matches homepage metric
    sortedLists = enrichedLists.sort((a, b) => (b._week_popularity || 0) - (a._week_popularity || 0));
  } else if (sort === "most_saved") {
    sortedLists = enrichedLists.sort((a, b) => b.save_count - a.save_count);
  }

  // Remove internal sorting field and check hasMore
  const hasMore = sortedLists.length > limit;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const finalLists = sortedLists.slice(0, limit).map(({ _week_save_count: _, ...list }) => list);

  return { lists: finalLists, hasMore };
}

/**
 * Get total count of public lists
 */
export async function getListsCount(): Promise<number> {
  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from("lists")
    .select("*", { count: "exact", head: true })
    .eq("is_public", true);

  if (error) {
    console.error("Error fetching lists count:", error);
    return 0;
  }

  return count || 0;
}

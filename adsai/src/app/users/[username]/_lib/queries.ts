/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient, createAdminClient } from "@/lib/supabase/server-client";

// (copied queries from previous [id] implementation; supports lookup by username or UUID)

export interface UserProfileDetails {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface UserStats {
  followers_count: number;
  following_count: number;
  watched_count: number;
}

export interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface FollowUserWithExtras extends FollowUser {
  favorites: Array<{
    id: string;
    title: string;
    slug: string;
    poster_url: string | null;
  }>;
  isFollowing: boolean;
  isCurrentUser: boolean;
}

export interface LoggedMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  rating: number | null;
  watched_date: string | null;
}

export interface UserReview {
  id: string;
  title: string | null;
  body: string | null;
  contains_spoilers?: boolean;
  created_at: string;
  movie: {
    id: string;
    title: string;
    slug: string;
    poster_url: string | null;
  };
  user_rating: number | null;
}

export interface UserList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  item_count: number;
  save_count?: number;
}

/**
 * * Retrieves the user's profile details by ID or username.
 *  *
 *  * @param {string} idOrUsername - The ID of the user or their username to retrieve.
 *  * @returns {Promise<UserProfileDetails | null>} The user's profile details if found, otherwise null.
 */
export async function getUserProfile(idOrUsername: string): Promise<UserProfileDetails | null> {
  const supabase = await createServerClient();
  const normalized = idOrUsername.trim();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalized);

  let query = supabase.from("profiles").select("id, username, avatar_url, bio, created_at");
  if (isUUID) query = query.eq("id", normalized);
  else query = query.ilike("username", normalized);

  const { data: profile, error } = await query.single();
  if (error || !profile) return null;
  return profile;
}

/**
 * * Retrieves user statistics, including the number of followers, following users, and ratings.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve statistics for.
 *  * @returns {Promise<UserStats>} A promise resolving with an object containing the user's statistics.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createServerClient();
  const adminClient = createAdminClient();

  const [followersResult, followingResult, watchedResult] = await Promise.all([
    adminClient.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    adminClient.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    supabase.from("ratings").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    followers_count: followersResult.count || 0,
    following_count: followingResult.count || 0,
    watched_count: watchedResult.count || 0,
  };
}

// The rest of the file mirrors the original queries implementation (ratings, lists, follows, etc.)
// To keep this patch concise the remaining functions are implemented identically to the previous file.

/**
 * * Retrieves the recent movies of a user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve movies for.
 *  * @param {number} [limit=10] - The maximum number of movies to return (default is 10).
 *  * @returns {Promise<LoggedMovie[]>} A promise resolving to an array of logged movie objects, or an empty array if no data was returned.
 */
export async function getUserRecentMovies(userId: string, limit: number = 10): Promise<LoggedMovie[]> {
  const supabase = await createServerClient();
  const { data: ratings, error } = await supabase.from("ratings").select(`
      score,
      created_at,
      movie_id,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `).eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error || !ratings) return [];
  return ratings.map((rating) => {
    const movie = rating.movies as any;
    return { id: movie.id, title: movie.title, slug: movie.slug, poster_url: movie.poster_url, rating: rating.score, watched_date: rating.created_at };
  });
}

/**
 * * Retrieves a list of user reviews for the specified user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve reviews for.
 *  * @param {number} [limit=5] - The maximum number of reviews to return (default: 5).
 *  * @returns {Promise<UserReview[]>} A promise resolving to an array of user review objects.
 */
export async function getUserReviews(userId: string, limit: number = 5): Promise<UserReview[]> {
  const supabase = await createServerClient();
  const { data: reviews, error } = await supabase.from("reviews").select(`
      id,
      title,
      body,
      contains_spoilers,
      created_at,
      movie_id,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `).eq("user_id", userId).not("body","is", null).order("created_at", { ascending: false }).limit(limit);
  if (error || !reviews) return [];
  const reviewsWithRatings = await Promise.all(reviews.map(async (review: any) => {
    const movie = review.movies as any;
    const { data: rating } = await supabase.from("ratings").select("score").eq("user_id", userId).eq("movie_id", review.movie_id).single();
    return { id: review.id, title: review.title, body: review.body, contains_spoilers: !!review.contains_spoilers, created_at: review.created_at, movie, user_rating: rating?.score ?? null };
  }));
  return reviewsWithRatings;
}


export async function getUserReviewsCount(userId: string): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) {
    console.error("[getUserReviewsCount] Error fetching review count:", error);
    return 0;
  }
  return count || 0;
}

/**
 * * Retrieves a list of user's lists with additional information such as item count and save count.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve lists for.
 *  * @param {number} [limit=5] - The maximum number of lists to return.
 *  * @param {"created_at" | "saves"} [sortBy="created_at"] - The field to sort the lists by.
 *  * @param {string} [viewerId] - The ID of the viewer (optional).
 *  *
 *  * @returns {Promise<UserList[]>} A promise resolving to an array of user's lists with additional information.
 */
export async function getUserLists(userId: string, limit: number = 5, sortBy: "created_at" | "saves" = "created_at", viewerId?: string): Promise<UserList[]> {
  const supabase = await createServerClient();
  const isOwner = !!viewerId && viewerId === userId;
  let query = supabase.from("lists").select("id, name, description, is_public").eq("user_id", userId);
  if (!isOwner) query = query.eq("is_public", true);
  query = query.order("created_at", { ascending: false }).limit(sortBy === "created_at" ? limit : 100);
  const { data: lists, error } = await query;
  if (error || !lists) return [];
  const listsWithCounts = await Promise.all(lists.map(async (list: any) => {
    const [itemCount, saveCount] = await Promise.all([
      supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", list.id),
      supabase.from("saved_lists").select("*", { count: "exact", head: true }).eq("list_id", list.id),
    ]);
    return { ...list, item_count: itemCount.count || 0, save_count: saveCount.count || 0 };
  }));
  if (sortBy === "saves") {
    return listsWithCounts.sort((a,b) => (b.save_count||0)-(a.save_count||0)).slice(0, limit);
  }
  return listsWithCounts;
}

/**
 * * Retrieves the watchlist count for a given user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve the watchlist count for.
 *  * @returns {Promise<number>} A promise resolving with the watchlist count, or 0 if an error occurs.
 */
export async function getUserWatchlistCount(userId: string): Promise<number> { const supabase = await createServerClient(); const { count, error } = await supabase.from("watchlist").select("*", { count: "exact", head: true }).eq("user_id", userId); if (error) return 0; return count || 0; }

/**
 * * Retrieves the user's watchlist for a given user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve the watchlist for.
 *  * @param {number} [limit=50] - The maximum number of items to return in the watchlist. Defaults to 50.
 *  * @returns {LoggedMovie[]} An array of logged movie objects, or an empty array if no data is found.
 */
export async function getUserWatchlist(userId: string, limit: number = 50): Promise<LoggedMovie[]> { const supabase = await createServerClient(); const { data: watchlist, error } = await supabase.from("watchlist").select(`
      movie_id,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `).eq("user_id", userId).limit(limit); if (error || !watchlist) return []; return watchlist.map((item:any) => { const movie = item.movies as any; return { id: movie.id, title: movie.title, slug: movie.slug, poster_url: movie.poster_url, rating: null, watched_date: null }; }); }

/**
 * * Retrieves user ratings for a given user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve ratings for.
 *  * @param {number} [limit=50] - The maximum number of ratings to return (default is 50).
 *  * @returns {Promise<LoggedMovie[]>} A promise resolving to an array of logged movie objects, each containing the movie's ID, title, slug, poster URL, rating, and watched date.
 */
export async function getUserRatings(userId: string, limit: number = 50): Promise<LoggedMovie[]> { const supabase = await createServerClient(); const { data: ratings, error } = await supabase.from("ratings").select(`
      score,
      created_at,
      movie_id,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `).eq("user_id", userId).order("score", { ascending: false }).order("created_at", { ascending: false }).limit(limit); if (error || !ratings) return []; return ratings.map((rating:any) => { const movie = rating.movies as any; return { id: movie.id, title: movie.title, slug: movie.slug, poster_url: movie.poster_url, rating: rating.score, watched_date: rating.created_at }; }); }

/**
 * * Retrieves paginated user ratings for a given user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve ratings for.
 *  * @param {number} from - The starting index of the rating list (inclusive).
 *  * @param {number} limit - The number of ratings to return.
 *  * @returns {Promise<{ ratings: LoggedMovie[]; count: number }>} A promise resolving with an object containing the paginated user ratings and their total count.
 */
export async function getUserRatingsPaginated(
  userId: string,
  from: number,
  limit: number
): Promise<{ ratings: LoggedMovie[]; count: number }> {
  const supabase = await createServerClient();

  const { data: ratings, error, count } = await supabase
    .from("ratings")
    .select(
      `
      score,
      created_at,
      movie_id,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error || !ratings) return { ratings: [], count: 0 };

  const mappedRatings = ratings.map((rating: any) => {
    const movie = rating.movies as any;
    return {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      poster_url: movie.poster_url,
      rating: rating.score,
      watched_date: rating.created_at,
    };
  });

  return { ratings: mappedRatings, count: count || 0 };
}

/**
 * * Retrieves the user's watchlist paginated.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve the watchlist for.
 *  * @param {number} from - The starting index of the page in the watchlist.
 *  * @param {number} limit - The number of items per page in the watchlist.
 *  * @returns {Promise<{ watchlist: LoggedMovie[]; count: number }>} A promise resolving to an object containing the user's watchlist and the total count of items.
 */
export async function getUserWatchlistPaginated(userId: string, from: number, limit: number): Promise<{ watchlist: LoggedMovie[]; count: number }> { const supabase = await createServerClient(); const { data: watchlistItems, error, count } = await supabase.from("watchlist").select(`
      movie_id,
      movies!inner (
        id,
        title,
        slug,
        poster_url
      )
    `, { count: "exact" }).eq("user_id", userId).range(from, from + limit - 1); if (error) return { watchlist: [], count: 0 }; if (!watchlistItems) return { watchlist: [], count: count || 0 }; const mappedWatchlist = watchlistItems.map((item:any) => { const movie = item.movies as any; return { id: movie.id, title: movie.title, slug: movie.slug, poster_url: movie.poster_url, rating: null, watched_date: null }; }); return { watchlist: mappedWatchlist, count: count || 0 }; }

/**
 * * Checks if the user with the given currentUserId is following the user with the given targetUserId.
 *  *
 *  * @param {string} currentUserId - The ID of the user currently authenticated.
 *  * @param {string} targetUserId - The ID of the user to check follow status for.
 *  * @returns {Promise<boolean>} A promise that resolves to true if the current user is following the target user, false otherwise.
 */
export async function getIsFollowing(currentUserId: string, targetUserId: string): Promise<boolean> { const supabase = await createServerClient(); const { data, error } = await supabase.from("follows").select("follower_id").eq("follower_id", currentUserId).eq("following_id", targetUserId).maybeSingle(); if (error) { console.error("[getIsFollowing] Error checking follow status:", error); return false; } return !!data; }

/**
 * * Retrieves the current user's information from Supabase.
 *  *
 *  * @param {object} None
 *  * @returns {{ id: string; username: string } | null} The current user's profile data, or null if authentication failed or no user found.
 */
export async function getCurrentUser(): Promise<{ id: string; username: string } | null> { const supabase = await createServerClient(); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) return null; const { data: profile, error: profileError } = await supabase.from("profiles").select("id, username").eq("id", user.id).single(); if (profileError || !profile) return null; return profile; }

/**
 * * Retrieves the IDs of users that are being followed by the specified user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve followings for.
 *  * @returns {Promise<string[]>} A promise resolving to an array of followee IDs, or an empty array if an error occurs.
 */
export async function getFollowingIds(userId: string): Promise<string[]> { const adminClient = createAdminClient(); const { data, error } = await adminClient.from("follows").select("following_id").eq("follower_id", userId); if (error) { console.error("[getFollowingIds] Error fetching following IDs:", error); return []; } return data?.map((row:any) => row.following_id) ?? []; }

/**
 * * Retrieves a list of follower IDs for the specified user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve follower IDs for.
 *  * @returns {Promise<string[]>} A promise resolving to an array of follower IDs, or an empty array if an error occurs.
 */
export async function getFollowerIds(userId: string): Promise<string[]> { const adminClient = createAdminClient(); const { data, error } = await adminClient.from("follows").select("follower_id").eq("following_id", userId); if (error) { console.error("[getFollowerIds] Error fetching follower IDs:", error); return []; } return data?.map((row:any) => row.follower_id) ?? []; }

/**
 * * Retrieves the followers of a specified user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve followers for.
 *  * @returns {Promise<FollowUser[]>} A promise resolving to an array of follower objects, each containing the follower's profile information.
 */
export async function getFollowers(userId: string): Promise<FollowUser[]> { const adminClient = createAdminClient(); const { data: followsData, error: followsError } = await adminClient.from("follows").select("follower_id").eq("following_id", userId); if (followsError) { console.error("[getFollowers] Error fetching followers:", followsError); return []; } const followerIds = (followsData || []).map((f:any) => f.follower_id); if (followerIds.length === 0) return []; const { data: profiles, error: profilesError } = await adminClient.from("profiles").select("id, username, avatar_url, bio").in("id", followerIds); if (profilesError) { console.error("[getFollowers] Error fetching follower profiles:", profilesError); return []; } return profiles || []; }

/**
 * * Retrieves a list of users that the specified user is following.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve following for.
 *  * @returns {Promise<FollowUser[]>} A promise resolving to an array of follow user objects, or an empty array if no following data is found.
 */
export async function getFollowing(userId: string): Promise<FollowUser[]> { const adminClient = createAdminClient(); const { data: followsData, error: followsError } = await adminClient.from("follows").select("following_id").eq("follower_id", userId); if (followsError) { console.error("[getFollowing] Error fetching following:", followsError); return []; } const followingIds = (followsData || []).map((f:any) => f.following_id); if (followingIds.length === 0) return []; const { data: profiles, error: profilesError } = await adminClient.from("profiles").select("id, username, avatar_url, bio").in("id", followingIds); if (profilesError) { console.error("[getFollowing] Error fetching following profiles:", profilesError); return []; } return profiles || []; }

/**
 * * Retrieves the number of followers for a given user ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve followers for.
 *  * @returns {Promise<number>} A promise resolving with the total number of followers, or 0 if an error occurs.
 */
export async function getFollowersCount(userId: string): Promise<number> { const adminClient = createAdminClient(); const { count, error } = await adminClient.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId); if (error) { console.error("[getFollowersCount] Error fetching followers count:", error); return 0; } return count || 0; }

/**
 * * Retrieves the number of users followed by a given user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve the following count for.
 *  * @returns {Promise<number>} A promise resolving with the total number of users followed, or 0 if an error occurs.
 */
export async function getFollowingCount(userId: string): Promise<number> { const adminClient = createAdminClient(); const { count, error } = await adminClient.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId); if (error) { console.error("[getFollowingCount] Error fetching following count:", error); return 0; } return count || 0; }

/**
 * * Retrieves the follow status of a user for multiple target users.
 *  *
 *  * @param {string} currentUserId - The ID of the current user.
 *  * @param {string[]} targetUserIds - An array of IDs of the target users to check.
 *  * @returns {Promise<Map<string, boolean>>} A promise that resolves with a map containing the follow status for each target user.
 */
export async function getBatchFollowStatus(currentUserId: string, targetUserIds: string[]): Promise<Map<string, boolean>> { const adminClient = createAdminClient(); const result = new Map<string, boolean>(); targetUserIds.forEach((id) => result.set(id, false)); if (!currentUserId || targetUserIds.length === 0) return result; const { data, error } = await adminClient.from("follows").select("following_id").eq("follower_id", currentUserId).in("following_id", targetUserIds); if (error) { console.error("[getBatchFollowStatus] Error batch checking follow status:", error); return result; } data?.forEach((row:any) => result.set(row.following_id, true)); return result; }

/**
 * * Retrieves the top-rated movies of a user with the specified ID.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve favorites for.
 *  * @param {number} [limit=3] - The maximum number of results to return (default: 3).
 *  * @returns {object[]} An array of objects containing movie data, or an empty array if an error occurs.
 */
export async function getUserFavorites(userId: string, limit: number = 3) { const supabase = await createServerClient(); const { data: topMovies, error } = await supabase.from("ratings").select(`
      score,
      movies (
        id,
        title,
        slug,
        poster_url
      )
    `).eq("user_id", userId).order("score", { ascending: false }).order("created_at", { ascending: false }).limit(limit); if (error) { console.error("Error fetching user favorites:", error); return []; } return (topMovies || []).map((rating:any) => { const movie = rating.movies as any; return { id: movie.id, title: movie.title, slug: movie.slug, poster_url: movie.poster_url }; }); }

/**
 * * Enriches an array of FollowUser objects with additional information.
 *  *
 *  * @param {FollowUser[]} users - The array of FollowUser objects to enrich.
 *  * @param {string | null} currentUserId - The ID of the currently logged in user, or null if not logged in.
 *  * @returns {Promise<FollowUserWithExtras[]>} A promise resolving to an array of enriched FollowUserWithExtras objects.
 */
export async function enrichUsersWithExtras(users: FollowUser[], currentUserId: string | null): Promise<FollowUserWithExtras[]> { if (users.length === 0) return []; const userIds = users.map((u) => u.id); const followStatusMap = currentUserId ? await getBatchFollowStatus(currentUserId, userIds) : new Map<string, boolean>(); const enrichedUsers = await Promise.all(users.map(async (user) => { const favorites = await getUserFavorites(user.id, 3); return { ...user, favorites, isFollowing: followStatusMap.get(user.id) || false, isCurrentUser: currentUserId === user.id }; })); return enrichedUsers; }

export interface SavedList { id: string; name: string; description: string | null; is_public: boolean; item_count: number; creator: { id: string; username: string; avatar_url: string | null; }; }

/**
 * * Retrieves saved lists for a given user.
 *  *
 *  * @param {string} userId - The ID of the user to retrieve saved lists for.
 *  * @param {number} [limit=20] - The maximum number of saved lists to return. Defaults to 20.
 *  * @returns {Promise<SavedList[]>} A promise resolving to an array of saved list objects, or an empty array if no saved lists are found.
 */
export async function getUserSavedLists(userId: string, limit: number = 20): Promise<SavedList[]> { const adminClient = createAdminClient(); const supabase = await createServerClient(); const { data: savedListRefs, error: savedError } = await adminClient.from("list_saves").select("list_id").eq("user_id", userId).limit(limit); if (savedError) { console.error("Error fetching saved list references:", savedError); return []; } if (!savedListRefs || savedListRefs.length === 0) return []; const listIds = savedListRefs.map((s:any) => s.list_id); const { data: lists, error: listsError } = await supabase.from("lists").select("id, name, description, is_public, user_id").in("id", listIds).eq("is_public", true); if (listsError) { console.error("Error fetching saved lists:", listsError); return []; } if (!lists || lists.length === 0) return []; const enrichedLists = await Promise.all(lists.map(async (list:any) => { const { count: itemCount } = await supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", list.id); const { data: creator } = await supabase.from("profiles").select("id, username, avatar_url").eq("id", list.user_id).single(); return { id: list.id, name: list.name, description: list.description, is_public: list.is_public, item_count: itemCount || 0, creator: creator || { id: "", username: "Unknown", avatar_url: null } }; })); return enrichedLists; }

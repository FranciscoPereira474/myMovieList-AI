"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { getFollowingIds } from "@/app/users/[username]/_lib/queries";

export interface ReviewFilters {
  hideSpoilers?: boolean;
  ratingMin?: number;
  ratingMax?: number;
  friendsOnly?: boolean;
  sortBy?: "recent" | "popular" | "most_liked" | "most_disliked";
}

export interface Review {
  id: string;
  body: string | null;
  title: string | null;
  contains_spoilers: boolean;
  created_at: string;
  user_id: string;
  movie_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
  movies: {
    id: string;
    title: string;
    slug: string;
    poster_url: string | null;
    release_date: string | null;
  } | null;
  rating: number;
  upvotes_count: number;
  downvotes_count: number;
  comments_count: number;
  user_vote: Array<{
    is_upvote: boolean;
  }>;
}

// Row type for the `reviews_with_counts` view used when doing popularity-based queries
interface ViewRow {
  id: string;
  body: string | null;
  title: string | null;
  contains_spoilers: boolean;
  created_at: string;
  user_id: string;
  movie_id: string;
  username?: string;
  avatar_url?: string | null;
  movie_title?: string;
  movie_slug?: string;
  poster_url?: string | null;
  release_date?: string | null;
  upvotes_count?: number;
  downvotes_count?: number;
  comments_count?: number;
  rating_score?: number;
  popularity?: number;
}

/**
 * * Retrieves a list of reviews for the specified user, filtered by various criteria.
 *  *
 *  * @param {string | null} userId - The ID of the user to retrieve reviews for. If null, all users are retrieved.
 *  * @param {ReviewFilters} filters - An object containing filter options.
 *  * @param {number} page - The page number to retrieve (0-indexed).
 *  * @param {number} pageSize - The number of reviews to return per page.
 *  *
 *  * @returns {Promise<Review[]>} A promise resolving to an array of review objects, or an empty array if no reviews are found.
 */
export async function getReviews(
  userId: string | null,
  filters: ReviewFilters = {},
  page: number = 0,
  pageSize: number = 20,
  authorId?: string | null
): Promise<Review[]> {
  const supabase = await createServerClient();

  // Build the query
  let query = supabase
    .from("reviews")
    .select(
      `
      id,
      body,
      title,
      contains_spoilers,
      created_at,
      user_id,
      movie_id,
      profiles!reviews_user_id_fkey (
        username,
        avatar_url
      ),
      movies!reviews_movie_id_fkey (
        id,
        title,
        slug,
        poster_url,
        release_date
      )
    `
    )
    .order("created_at", { ascending: false });

  // Apply spoiler filter
  if (filters.hideSpoilers) {
    query = query.eq("contains_spoilers", false);
  }

  // Apply friends only filter
  if (filters.friendsOnly && userId) {
    // Get user's friends (users they follow)
    const friendIds = await getFollowingIds(userId);

    if (friendIds.length > 0) {
      query = query.in("user_id", friendIds);
    } else {
      // No friends, return empty
      return [];
    }
  }

  // If an authorId is provided, fetch only that user's reviews
  if (authorId) {
    query = query.eq("user_id", authorId);
  }

  // Decide whether we need global sorting (popularity / most_liked / most_disliked)
  const needsGlobalSort = !!filters.sortBy && filters.sortBy !== "recent";

  // If we need global sort, fetch a larger set (or all) matching reviews, then sort in-memory
  // to produce a globally-sorted paginated slice. To avoid unbounded fetches, apply a reasonable cap.
  const GLOBAL_FETCH_CAP = 2000;

  // Apply pagination offset (used later when slicing sorted results)
  const offset = page * pageSize;

  if (!needsGlobalSort) {
    // Server-side pagination by created_at (default recent ordering)
    query = query.range(offset, offset + pageSize - 1);
  } else {
    // Prefer true DB-side pagination when possible: if a materialized/view `reviews_with_counts`
    // exists (see README / SQL below), query it to get true popularity-based pagination.
    // Otherwise fall back to fetching a capped set and sorting in-memory.
    try {
      const viewQuery = supabase
        .from("reviews_with_counts")
        .select(`
          id,
          body,
          title,
          contains_spoilers,
          created_at,
          user_id,
          movie_id,
          username,
          avatar_url,
          movie_title,
          movie_slug,
          poster_url,
          release_date,
          upvotes_count,
          downvotes_count,
          comments_count,
          rating_score,
          popularity
        `)
        .order("popularity", { ascending: false });

      if (filters.hideSpoilers) viewQuery.eq("contains_spoilers", false);

      if (filters.ratingMin !== undefined) viewQuery.gte("rating_score", filters.ratingMin * 2);
      if (filters.ratingMax !== undefined) viewQuery.lte("rating_score", filters.ratingMax * 2);

      if (filters.friendsOnly && userId) {
        const friendIds = await getFollowingIds(userId);
        if (friendIds.length > 0) {
          viewQuery.in("user_id", friendIds);
        } else {
          return [];
        }
      }

      if (authorId) viewQuery.eq("user_id", authorId);

      const { data: viewData, error: viewError } = await viewQuery.range(offset, offset + pageSize - 1);

      if (!viewError && viewData && viewData.length > 0) {
        // If a user is logged in, fetch their votes for these reviews so we can populate `user_vote`.
        const viewReviewIds = viewData.map((r: ViewRow) => r.id);
        let viewUserVotes: Record<string, boolean> = {};
        if (userId) {
          const { data: votes } = await supabase
            .from("review_votes")
            .select("review_id, is_upvote")
            .eq("user_id", userId)
            .in("review_id", viewReviewIds);

          if (votes) {
            viewUserVotes = votes.reduce((acc, v) => {
              acc[v.review_id] = v.is_upvote;
              return acc;
            }, {} as Record<string, boolean>);
          }
        }

        // Map the view rows into the Review[] shape expected by the UI
        return viewData.map((row: ViewRow) => ({
          id: row.id,
          body: row.body,
          title: row.title,
          contains_spoilers: row.contains_spoilers,
          created_at: row.created_at,
          user_id: row.user_id,
          movie_id: row.movie_id,
          profiles: {
            username: row.username,
            avatar_url: row.avatar_url,
          },
          movies: {
            id: row.movie_id,
            title: row.movie_title,
            slug: row.movie_slug,
            poster_url: row.poster_url,
            release_date: row.release_date,
          },
          rating: row.rating_score || 0,
          upvotes_count: row.upvotes_count || 0,
          downvotes_count: row.downvotes_count || 0,
          comments_count: row.comments_count || 0,
          user_vote:
            userId && viewUserVotes[row.id] !== undefined
              ? [{ is_upvote: viewUserVotes[row.id] }]
              : [],
        })) as Review[];
      }

      // If view query failed or returned no rows, fall back to capped fetch below
    } catch {
      // ignore and fall back to in-memory global sort
    }

    // When sorting by popularity/likes/dislikes, and no DB view is available,
    // fetch up to GLOBAL_FETCH_CAP and sort in-memory later.
    query = query.limit(GLOBAL_FETCH_CAP);
  }

  const { data: reviews, error } = await query;

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  if (!reviews || reviews.length === 0) {
    return [];
  }

  const reviewIds = reviews.map((r) => r.id);
  const movieIds = reviews.map((r) => r.movie_id);
  const userIds = reviews.map((r) => r.user_id);

  // Fetch ratings for the users' movies
  let ratingsQuery = supabase
    .from("ratings")
    .select("user_id, movie_id, score")
    .in("user_id", userIds)
    .in("movie_id", movieIds);

  // Apply rating range filter
  if (filters.ratingMin !== undefined || filters.ratingMax !== undefined) {
    if (filters.ratingMin !== undefined) {
      ratingsQuery = ratingsQuery.gte("score", filters.ratingMin * 2); // Convert 0-5 to 0-10
    }
    if (filters.ratingMax !== undefined) {
      ratingsQuery = ratingsQuery.lte("score", filters.ratingMax * 2); // Convert 0-5 to 0-10
    }
  }

  const { data: ratings } = await ratingsQuery;

  // rewatchesOnly removed — no rewatch filtering

  // Fetch upvotes count
  const { data: upvotes } = await supabase
    .from("review_votes")
    .select("review_id")
    .eq("is_upvote", true)
    .in("review_id", reviewIds);

  // Fetch downvotes count
  const { data: downvotes } = await supabase
    .from("review_votes")
    .select("review_id")
    .eq("is_upvote", false)
    .in("review_id", reviewIds);

  // Fetch comments count
  const { data: comments } = await supabase
    .from("comments")
    .select("review_id")
    .in("review_id", reviewIds);

  // Fetch current user's votes if logged in
  let userVotes: Record<string, boolean> = {};
  if (userId) {
    const { data: votes } = await supabase
      .from("review_votes")
      .select("review_id, is_upvote")
      .eq("user_id", userId)
      .in("review_id", reviewIds);

    if (votes) {
      userVotes = votes.reduce(
        (acc, vote) => {
          acc[vote.review_id] = vote.is_upvote;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
  }

  // Count aggregates
  const upvoteCounts =
    upvotes?.reduce(
      (acc, vote) => {
        acc[vote.review_id] = (acc[vote.review_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const downvoteCounts =
    downvotes?.reduce(
      (acc, vote) => {
        acc[vote.review_id] = (acc[vote.review_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const commentCounts =
    comments?.reduce(
      (acc, comment) => {
        acc[comment.review_id] = (acc[comment.review_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // Build ratings map
  const ratingsMap =
    ratings?.reduce(
      (acc, rating) => {
        const key = `${rating.user_id}_${rating.movie_id}`;
        acc[key] = rating.score;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // Filter out reviews that don't match the rating range
  let filteredReviews = reviews;
  if (filters.ratingMin !== undefined || filters.ratingMax !== undefined) {
    filteredReviews = reviews.filter((review) => {
      const rating = ratingsMap[`${review.user_id}_${review.movie_id}`];
      // Treat only `undefined`/`null` as missing; allow 0 values if present
      if (rating === undefined || rating === null) return false;

      const normalizedRating = rating / 2; // Convert 1-10 to 0-5

      if (filters.ratingMin !== undefined && normalizedRating < filters.ratingMin) {
        return false;
      }
      if (filters.ratingMax !== undefined && normalizedRating > filters.ratingMax) {
        return false;
      }

      return true;
    });
  }

  // If we need global sorting, sort the filteredReviews by requested metric across the whole set
  // then slice the requested page range. Otherwise just map and return the current page results.
  if (needsGlobalSort) {
    const sorted = [...filteredReviews].sort((a, b) => {
      if (filters.sortBy === "popular") {
        const popA = (upvoteCounts[a.id] || 0) + (downvoteCounts[a.id] || 0) + (commentCounts[a.id] || 0);
        const popB = (upvoteCounts[b.id] || 0) + (downvoteCounts[b.id] || 0) + (commentCounts[b.id] || 0);
        return popB - popA;
      } else if (filters.sortBy === "most_liked") {
        return (upvoteCounts[b.id] || 0) - (upvoteCounts[a.id] || 0);
      } else if (filters.sortBy === "most_disliked") {
        return (downvoteCounts[b.id] || 0) - (downvoteCounts[a.id] || 0);
      }
      // Fallback to recent
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const paged = sorted.slice(offset, offset + pageSize);

    return paged.map((review) => ({
    ...review,
    profiles: Array.isArray(review.profiles)
      ? review.profiles[0]
      : review.profiles,
    movies: Array.isArray(review.movies) ? review.movies[0] : review.movies,
    rating: ratingsMap[`${review.user_id}_${review.movie_id}`] || 0,
    upvotes_count: upvoteCounts[review.id] || 0,
    downvotes_count: downvoteCounts[review.id] || 0,
    comments_count: commentCounts[review.id] || 0,
    user_vote:
      userId && userVotes[review.id] !== undefined
        ? [{ is_upvote: userVotes[review.id] }]
        : [],
    })) as Review[];

  }

  // Default: return the (already paginated) filteredReviews
  return filteredReviews.map((review) => ({
    ...review,
    profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles,
    movies: Array.isArray(review.movies) ? review.movies[0] : review.movies,
    rating: ratingsMap[`${review.user_id}_${review.movie_id}`] || 0,
    upvotes_count: upvoteCounts[review.id] || 0,
    downvotes_count: downvoteCounts[review.id] || 0,
    comments_count: commentCounts[review.id] || 0,
    user_vote:
      userId && userVotes[review.id] !== undefined
        ? [{ is_upvote: userVotes[review.id] }]
        : [],
  })) as Review[];

}

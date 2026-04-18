"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { getFollowingIds } from "@/app/users/[username]/_lib/queries";

export interface ReviewFilters {
  hideSpoilers?: boolean;
  ratingRange?: [number, number];
  friendsOnly?: boolean;
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

/**
 * * Retrieves a list of reviews based on the provided filters and pagination.
 *  *
 *  * @param {string | null} userId - The ID of the user to filter by (optional).
 *  * @param {ReviewFilters} filters - An object containing filtering options (default: {}).
 *  * @param {number} offset - The starting point for pagination (default: 0).
 *  * @param {number} limit - The number of reviews to return per page (default: 20).
 *  *
 *  * @returns {Promise<Review[]>} A promise resolving to an array of review objects.
 */
export async function getReviews(
  userId: string | null,
  filters: ReviewFilters = {},
  offset: number = 0,
  limit: number = 20
): Promise<Review[]> {
  const supabase = await createServerClient();

  // Build the base query
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
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters.hideSpoilers) {
    query = query.eq("contains_spoilers", false);
  }

  // For friends only, we need to filter by followed users
  if (filters.friendsOnly && userId) {
    const followedIds = await getFollowingIds(userId);

    if (followedIds.length > 0) {
      query = query.in("user_id", followedIds);
    } else {
      // User has no friends, return empty
      return [];
    }
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
  const { data: ratings } = await supabase
    .from("ratings")
    .select("user_id, movie_id, score")
    .in("user_id", userIds)
    .in("movie_id", movieIds);

  // Apply rating range filter after fetching ratings
  let filteredReviewIds = reviewIds;
  if (filters.ratingRange && ratings) {
    const [minRating, maxRating] = filters.ratingRange;
    const ratingsMap = ratings.reduce(
      (acc, rating) => {
        const key = `${rating.user_id}_${rating.movie_id}`;
        acc[key] = rating.score;
        return acc;
      },
      {} as Record<string, number>
    );

    filteredReviewIds = reviews
      .filter((review) => {
        const rating = ratingsMap[`${review.user_id}_${review.movie_id}`] || 0;
        // Convert 1-10 scale to 1-5 scale for comparison
        const scaledRating = rating / 2;
        return scaledRating >= minRating && scaledRating <= maxRating;
      })
      .map((r) => r.id);
  }

  // Filter reviews based on rating range
  const filteredReviews = reviews.filter((r) =>
    filteredReviewIds.includes(r.id)
  );

  if (filteredReviews.length === 0) {
    return [];
  }

  const finalReviewIds = filteredReviews.map((r) => r.id);

  // Fetch upvotes count
  const { data: upvotes } = await supabase
    .from("review_votes")
    .select("review_id")
    .eq("is_upvote", true)
    .in("review_id", finalReviewIds);

  // Fetch downvotes count
  const { data: downvotes } = await supabase
    .from("review_votes")
    .select("review_id")
    .eq("is_upvote", false)
    .in("review_id", finalReviewIds);

  // Fetch comments count
  const { data: comments } = await supabase
    .from("comments")
    .select("review_id")
    .in("review_id", finalReviewIds);

  // Fetch current user's votes if logged in
  let userVotes: Record<string, boolean> = {};
  if (userId) {
    const { data: votes } = await supabase
      .from("review_votes")
      .select("review_id, is_upvote")
      .eq("user_id", userId)
      .in("review_id", finalReviewIds);

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

  return filteredReviews.map((review) => ({
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

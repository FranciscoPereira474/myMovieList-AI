/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";

export interface ReviewDetails {
  id: string;
  title: string | null;
  body: string | null;
  contains_spoilers: boolean;
  watched_date: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  movie: {
    id: string;
    title: string;
    poster_url: string | null;
    backdrop_url: string | null;
    release_date: string | null;
    slug: string;
  };
  user_rating: number | null;
  upvotes_count: number;
  downvotes_count: number;
  comments_count: number;
  currentUserVote: "up" | "down" | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  likes_count: number;
  dislikes_count: number;
  userVote: 1 | -1 | null;
}

/**
 * * Retrieves review details by ID, including user and movie information.
 *  *
 *  * @param {string} reviewId - The ID of the review to retrieve.
 *  * @param {string} [currentUserId] - The current user's ID (optional).
 *  * @returns {Promise<ReviewDetails | null>} A promise resolving to the review details or null if an error occurs.
 */
export async function getReviewById(reviewId: string, currentUserId?: string): Promise<ReviewDetails | null> {
  const supabase = await createServerClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .select(`
      *,
      user:profiles!user_id(*),
      movie:movies(*)
    `)
    .eq("id", reviewId)
    .single();

    if (error || !review) {
      console.warn("Error fetching review:", error?.message ?? error);
      return null;
    }

  // Fetch rating
  const { data: rating } = await supabase
    .from("ratings")
    .select("score")
    .eq("user_id", review.user_id)
    .eq("movie_id", review.movie_id)
    .maybeSingle();

  // Fetch votes
  const { count: upvotes } = await supabase
    .from("review_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId)
    .eq("is_upvote", true);

  const { count: downvotes } = await supabase
    .from("review_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId)
    .eq("is_upvote", false);

  const { count: comments } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  let currentUserVote: "up" | "down" | null = null;
  if (currentUserId) {
    const { data: vote } = await supabase
      .from("review_votes")
      .select("is_upvote")
      .eq("review_id", reviewId)
      .eq("user_id", currentUserId)
      .single();
    
    if (vote) {
      currentUserVote = vote.is_upvote ? "up" : "down";
    }
  }

  return {
    id: review.id,
    title: review.title,
    body: review.body,
    contains_spoilers: review.contains_spoilers ?? false,
    watched_date: review.watched_date,
    created_at: review.created_at,
    updated_at: review.updated_at,
    user: review.user,
    movie: review.movie,
    user_rating: rating?.score ?? (review as any).rating ?? null,
    upvotes_count: upvotes || 0,
    downvotes_count: downvotes || 0,
    comments_count: comments || 0,
    currentUserVote,
  };
}

/**
 * * Retrieves a list of comments for a specific review.
 *  *
 *  * @param {string} reviewId - The ID of the review to fetch comments for.
 *  * @param {string} [currentUserId] - The current user's ID (optional).
 *  * @returns {Promise<Comment[]>} A promise resolving to an array of comment objects.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getReviewComments(reviewId: string, _currentUserId?: string): Promise<Comment[]> {
  const supabase = await createServerClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles!user_id(*),
      likes: comment_likes_count,
      dislikes: comment_dislikes_count,
      my_vote: user_vote
    `)
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching comments:", error?.message ?? error);
      return [];
    }

  return comments.map((comment: any) => ({
    id: comment.id,
    content: comment.body,
    created_at: comment.created_at,
    user: comment.user,
    likes_count: comment.likes || 0,
    dislikes_count: comment.dislikes || 0,
    userVote: comment.my_vote,
  }));
}

/**
 * * Retrieves the current user from Supabase authentication.
 *  *
 *  * @param {object} supabase - The Supabase server client instance.
 *  * @returns {object|null} The current user data, or null if an error occurs or no user is found.
 */
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * * Retrieves the top-rated movies for a given user.
 *  *
 *  * @param {string} userId The ID of the user to retrieve ratings for.
 *  * @param {string} [excludeMovieId] The ID of the current movie to exclude from ratings. Defaults to undefined.
 *  * @returns {Array<{movie: string, rating: number}>} An array of objects containing the title and score of each top-rated movie.
 */
export async function getUserTopRatedMovies(userId: string, excludeMovieId?: string) {
  const supabase = await createServerClient();

  // First, get all movies the user has rated (excluding the current movie)
  const { data: userRatings, error: ratingsError } = await supabase
    .from("ratings")
    .select(`
      score,
      movie_id,
      movie:movies (
        id,
        title
      )
    `)
    .eq("user_id", userId)
    .neq("movie_id", excludeMovieId || "");

    if (ratingsError || !userRatings || userRatings.length === 0) {
      console.warn("Error fetching user ratings:", ratingsError?.message ?? ratingsError);
      return [];
    }

  // Get the movie IDs the user has rated
  const ratedMovieIds = userRatings.map((r: any) => r.movie_id);

  // Get review counts for these movies (as a proxy for popularity)
  const { data: reviewCounts, error: reviewError } = await supabase
    .from("reviews")
    .select("movie_id")
    .in("movie_id", ratedMovieIds);

  if (reviewError) {
     console.warn("Error fetching review counts:", reviewError?.message ?? reviewError);
     // Fall back to just showing user's highest rated movies if we can't get popularity data
    return userRatings
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)
      .map((r: any) => ({
        movie: Array.isArray(r.movie) ? r.movie[0] : r.movie,
        rating: r.score
      }));
  }

  // Count reviews per movie
  const reviewCountMap = new Map<string, number>();
  reviewCounts?.forEach((review: any) => {
    const count = reviewCountMap.get(review.movie_id) || 0;
    reviewCountMap.set(review.movie_id, count + 1);
  });

  // Sort user's rated movies by popularity (review count), then take top 3
  const sortedByPopularity = userRatings
    .map((r: any) => ({
      movie: Array.isArray(r.movie) ? r.movie[0] : r.movie,
      rating: r.score,
      reviewCount: reviewCountMap.get(r.movie_id) || 0
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3);

  return sortedByPopularity.map(({ movie, rating }) => ({
    movie,
    rating
  }));
}

/**
 * * Checks if a movie is in the user's watchlist.
 *  *
 *  * @param {string} movieId - The ID of the movie to check.
 *  * @param {string} [userId] - The ID of the user checking the watchlist. If not provided, returns false.
 *  * @returns {Promise<boolean>} True if the movie is in the watchlist, false otherwise.
 */
export async function isMovieInWatchlist(movieId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("watchlist")
      .select("movie_id")
      .eq("movie_id", movieId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking watchlist:", error.message || error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking watchlist:", error);
    return false;
  }
}



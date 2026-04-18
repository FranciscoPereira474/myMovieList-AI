import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";
import { notFound } from "next/navigation";

// =============================================================================
// Type Definitions (based on new database schema)
// =============================================================================

/**
 * Genre entity from the `genres` table
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Person entity from the `people` table
 */
export interface Person {
  id: string;
  tmdb_id: number | null;
  name: string;
  profile_path: string | null;
}

/**
 * Cast member with role information from `movie_credits` join
 */
export interface CastMember extends Person {
  character_name: string | null;
  credit_order: number;
}

/**
 * User profile from the `profiles` table
 */
export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

/**
 * Movie details with joined data (genres, director)
 * Based on `movies` table + joins to `movie_genres`, `movie_credits`, `people`
 */
export interface MovieDetails {
  id: string;
  tmdb_id: number | null;
  title: string;
  slug: string;
  release_date: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
  trailer_url: string | null;
  created_at: string;
  genres: Genre[];
  director: Person | null;
}

/**
 * Rating statistics aggregated from the `ratings` table
 * Note: Ratings are stored as 1-10 in DB, displayed as 1-5 stars
 */
export interface MovieRatingStats {
  average_rating: number | null; // 1-5 scale for display
  total_ratings: number;
  distribution: [number, number, number, number, number]; // 1-5 stars buckets
}

/**
 * Review entity from the `reviews` table
 * Note: Reviews no longer contain ratings - ratings are in separate `ratings` table
 */
export interface MovieReview {
  id: string;
  title: string | null;
  body: string | null;
  contains_spoilers: boolean;
  watched_date: string | null;
  created_at: string;
  updated_at: string;
  user: UserProfile;
  user_rating: number | null; // Fetched separately from ratings table (1-10 scale)
  upvotes_count: number; // Count of review_votes where is_upvote = true
  downvotes_count: number; // Count of review_votes where is_upvote = false
  comments_count: number;
  currentUserVote: "up" | "down" | null; // Current user's vote on this review
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Fetch movie details by ID or slug
 */
export async function getMovieById(id: string): Promise<MovieDetails> {
  const supabase = await createServerClient();

  // Try to find movie by ID first, then by slug
  let query = supabase
    .from("movies")
    .select(`
      id,
      tmdb_id,
      title,
      slug,
      release_date,
      poster_url,
      backdrop_url,
      overview,
      trailer_url,
      created_at
    `);

  // Check if id is a valid UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id);
  }

  const { data: movie, error } = await query.single();

  if (error || !movie) {
    notFound();
  }

  // Fetch genres for this movie
  const { data: movieGenres } = await supabase
    .from("movie_genres")
    .select(`
      genre_id,
      genres:genre_id (
        id,
        name
      )
    `)
    .eq("movie_id", movie.id);

  const genres: Genre[] = movieGenres
    ?.map((mg) => mg.genres as unknown as Genre)
    .filter(Boolean) || [];

  // Fetch director
  const { data: directorCredit } = await supabase
    .from("movie_credits")
    .select(`
      people:person_id (
        id,
        tmdb_id,
        name,
        profile_path
      )
    `)
    .eq("movie_id", movie.id)
    .eq("role", "director")
    .limit(1)
    .single();

  const director = directorCredit?.people as unknown as Person | null;

  return {
    ...movie,
    genres,
    director,
  };
}

/**
 * Fetch cast members for a movie
 */
export async function getMovieCast(movieId: string, limit: number = 10): Promise<CastMember[]> {
  const supabase = await createServerClient();

  const { data: credits, error } = await supabase
    .from("movie_credits")
    .select(`
      character_name,
      credit_order,
      people:person_id (
        id,
        tmdb_id,
        name,
        profile_path
      )
    `)
    .eq("movie_id", movieId)
    .eq("role", "actor")
    .order("credit_order", { ascending: true })
    .limit(limit);

  if (error || !credits) {
    console.error("Error fetching movie cast:", error);
    return [];
  }

  return credits.map((credit) => {
    const person = credit.people as unknown as Person;
    return {
      ...person,
      character_name: credit.character_name,
      credit_order: credit.credit_order,
    };
  });
}

/**
 * Fetch rating statistics for a movie from the `ratings` table
 * Ratings are stored as 1-10 in DB, converted to 1-5 scale for display
 */
export async function getMovieRatingStats(movieId: string): Promise<MovieRatingStats> {
  const supabase = await createServerClient();

  const { data: ratings, error } = await supabase
    .from("ratings")
    .select("score")
    .eq("movie_id", movieId);

  if (error || !ratings) {
    return {
      average_rating: null,
      total_ratings: 0,
      distribution: [0, 0, 0, 0, 0],
    };
  }

  const scores = ratings.map((r) => r.score).filter((s): s is number => s !== null);
  const total_ratings = scores.length;

  if (total_ratings === 0) {
    return {
      average_rating: null,
      total_ratings: 0,
      distribution: [0, 0, 0, 0, 0],
    };
  }

  // Calculate average (scores are 1-10 in DB, convert to 1-5 scale)
  const sum = scores.reduce((a, b) => a + b, 0);
  const average_rating = (sum / total_ratings) / 2; // Convert to 5-star scale

  // Calculate distribution (convert 1-10 scale to 1-5 for display)
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  scores.forEach((score) => {
    // Convert 1-10 to 1-5: 1-2 -> 1, 3-4 -> 2, 5-6 -> 3, 7-8 -> 4, 9-10 -> 5
    const starRating = Math.ceil(score / 2);
    const index = Math.min(Math.max(starRating - 1, 0), 4);
    distribution[index]++;
  });

  return {
    average_rating,
    total_ratings,
    distribution,
  };
}

/**
 * Fetch reviews for a movie
 * Note: Reviews no longer contain ratings directly. User ratings are fetched separately
 * from the `ratings` table. Likes are now `review_votes` with `is_upvote` flag.
 */
export async function getMovieReviews(
  movieId: string,
  limit: number = 10,
  sortBy: "popular" | "recent" = "popular",
  currentUserId?: string | null
): Promise<MovieReview[]> {
  const supabase = await createServerClient();

  // First get reviews with user profile info
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      title,
      body,
      contains_spoilers,
      watched_date,
      created_at,
      updated_at,
      user_id,
      user:user_id (
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq("movie_id", movieId)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !reviews) {
    console.error("Error fetching movie reviews:", error);
    return [];
  }

  // Get votes, comments count, user rating, and current user's vote for each review
  const reviewsWithCounts = await Promise.all(
    reviews.map(async (review) => {
      // Base queries
      const [upvotesResult, downvotesResult, commentsResult, userRatingResult] = await Promise.all([
        // Count upvotes (is_upvote = true)
        supabase
          .from("review_votes")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id)
          .eq("is_upvote", true),
        // Count downvotes (is_upvote = false)
        supabase
          .from("review_votes")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id)
          .eq("is_upvote", false),
        // Count comments
        supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id),
        // Get reviewer's rating for this movie (if any)
        supabase
          .from("ratings")
          .select("score")
          .eq("user_id", review.user_id)
          .eq("movie_id", movieId)
          .single(),
      ]);

      // Fetch current user's vote separately if they're logged in
      let currentUserVote: "up" | "down" | null = null;
      if (currentUserId) {
        const { data: voteData } = await supabase
          .from("review_votes")
          .select("is_upvote")
          .eq("user_id", currentUserId)
          .eq("review_id", review.id)
          .single();

        if (voteData) {
          currentUserVote = voteData.is_upvote ? "up" : "down";
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
        user: review.user as unknown as UserProfile,
        user_rating: userRatingResult.data?.score ?? null,
        upvotes_count: upvotesResult.count || 0,
        downvotes_count: downvotesResult.count || 0,
        comments_count: commentsResult.count || 0,
        currentUserVote,
      };
    })
  );

  // Sort by popularity (upvotes - downvotes + comments) if needed
  if (sortBy === "popular") {
    reviewsWithCounts.sort(
      (a, b) => 
        (b.upvotes_count - b.downvotes_count + b.comments_count) - 
        (a.upvotes_count - a.downvotes_count + a.comments_count)
    );
  }

  return reviewsWithCounts;
}

/**
 * Get total review count for a movie
 */
export async function getMovieReviewCount(movieId: string): Promise<number> {
  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("movie_id", movieId)
    .not("body", "is", null);

  if (error) {
    console.error("Error fetching review count:", error);
    return 0;
  }

  return count || 0;
}

// =============================================================================
// Auth & User-specific Queries
// =============================================================================

/**
 * Current user session data for the movie page
 */
export interface CurrentUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

/**
 * User's interaction state with a specific movie
 */
export interface UserMovieState {
  rating: number | null; // 1-10 scale
  inWatchlist: boolean;
  hasReview: boolean;
  reviewId: string | null;
}

/**
 * Get the currently authenticated user (if any)
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }

  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
  };
}

/**
 * Get user's interaction state with a movie (rating, watchlist, review)
 */
export async function getUserMovieState(
  userId: string,
  movieId: string
): Promise<UserMovieState> {
  const supabase = await createServerClient();

  const [
    { data: rating },
    { data: watchlistItem },
    { data: review },
  ] = await Promise.all([
    // Get user's rating for this movie
    supabase
      .from("ratings")
      .select("score")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .single(),
    // Check if movie is in user's watchlist
    supabase
      .from("watchlist")
      .select("movie_id")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .single(),
    // Check if user has reviewed this movie
    supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .single(),
  ]);

  return {
    rating: rating?.score ?? null,
    inWatchlist: !!watchlistItem,
    hasReview: !!review,
    reviewId: review?.id ?? null,
  };
}

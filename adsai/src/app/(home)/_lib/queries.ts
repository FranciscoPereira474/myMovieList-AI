/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";
import { getMovieRecommendations } from "@/lib/recommendation_algorithm";
import { HOME_MIN_RATINGS } from "@/lib/recommendation_config";

/**
 * Fetch personalized recommendations for the current user
 * Falls back to popular movies if user is not authenticated or has insufficient ratings
 */
export async function getPersonalizedRecommendations(
  limit: number = 10,
  userId?: string
): Promise<RecommendedMovie[]> {
  try {
    // Lower the minRatings requirement so users with at least one rating
    // receive personalized recommendations. Also prefer an explicit
    // userId passed from the caller (avoids any session detection edge-cases).
    const recommendations = await getMovieRecommendations({
      userId,
      limit,
      contentWeight: 0.5, // 50/50 hybrid
      minRatings: HOME_MIN_RATINGS,
    });

    // Compute normalized match percentage relative to the highest score
    const maxScore = Math.max(...recommendations.map((r) => r.score), 0.00001);
    const topRecommendations = recommendations.slice(0, limit);

    // Fetch local ratings for the recommended movie ids to display the real average when available
    const supabase = await createServerClient();
    const movieIds = topRecommendations.map((r) => r.movieId);
    const { data: ratingRows } = await supabase
      .from('ratings')
      .select('movie_id, score')
      .in('movie_id', movieIds);

    const ratingMap = new Map<string, { total: number; count: number }>();
    ratingRows?.forEach((r) => {
      const cur = ratingMap.get(r.movie_id) || { total: 0, count: 0 };
      cur.total += r.score;
      cur.count += 1;
      ratingMap.set(r.movie_id, cur);
    });

    return topRecommendations.map((rec) => {
      const ratingInfo = ratingMap.get(rec.movieId);
      const average_rating = ratingInfo ? (ratingInfo.total / ratingInfo.count) / 2 : null; // convert 1-10 -> 1-5
      const match_percentage = maxScore > 0 ? (rec.score / maxScore) * 100 : 0;

      return {
        id: rec.movieId,
        title: rec.title,
        slug: rec.slug || '',
        poster_url: rec.posterUrl,
        release_date: rec.releaseDate,
        average_rating,
        match_percentage,
        is_popular_fallback: (rec as any).isPopularFallback ?? false,
      };
    });
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    // Fallback to existing getRecommendedMovies
    return getRecommendedMovies(limit);
  }
}

// Types for query results
export interface TrendingMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string | null;
  overview: string | null;
  average_rating: number | null;
  trailer_url: string | null;
}

export interface RecommendedMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  /** Match percentage relative to highest recommendation score (0-100) */
  match_percentage?: number | null;
  /** Indicates this was returned from the popular-movies fallback */
  is_popular_fallback?: boolean | null;
}

export interface PopularReview {
  id: string;
  title: string | null;
  body: string | null;
  contains_spoilers?: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  movie: {
    id: string;
    slug: string;
    title: string;
    poster_url: string | null;
    release_date: string | null;
  };
  user_rating: number | null; // Fetched from ratings table (1-10 scale)
  upvotes_count: number; // Count from review_votes where is_upvote = true
  downvotes_count: number; // Count from review_votes where is_upvote = false
  comments_count: number;
  currentUserVote: "up" | "down" | null; // Current user's vote on this review
}

export interface PopularList {
  id: string;
  name: string;
  description: string | null;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  movie_posters: { poster_url?: string | null; slug?: string | null }[];
  save_count: number;
  item_count: number;
  /** Whether the list is public (true) or private (false) */
  isPublic?: boolean;
}

export interface TopRatedMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  average_rating: number | null;
}

/**
 * Fetch a single trending/featured movie for the hero section
 * @deprecated Use getTrendingMovies instead for slideshow support
 */
export async function getTrendingMovie(): Promise<TrendingMovie | null> {
  const movies = await getTrendingMovies(1);
  return movies[0] || null;
}

/**
 * Fetch multiple trending/featured movies for the hero slideshow
 * "Trending" = Movies with the most ratings count in the last 7 days
 */
export async function getTrendingMovies(
  limit: number = 10
): Promise<TrendingMovie[]> {
  const supabase = await createServerClient();

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Get ratings from the last 7 days and count by movie_id
  const { data: recentRatings, error: ratingsError } = await supabase
    .from("ratings")
    .select("movie_id")
    .gte("created_at", sevenDaysAgoISO);

  if (ratingsError) {
    console.error("Error fetching recent ratings:", ratingsError);
    return [];
  }

  // Count ratings per movie and sort by count (descending)
  const movieRatingCounts = new Map<string, number>();
  recentRatings?.forEach((rating) => {
    const count = movieRatingCounts.get(rating.movie_id) || 0;
    movieRatingCounts.set(rating.movie_id, count + 1);
  });

  // Sort movie IDs by rating count (descending)
  const sortedMovieIds = Array.from(movieRatingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId]) => movieId);

  // If no trending movies in the last 7 days, fall back to recent movies with backdrops
  if (sortedMovieIds.length === 0) {
    const { data: fallbackMovies, error: fallbackError } = await supabase
      .from("movies")
      .select(`
        id,
        title,
        slug,
        poster_url,
        backdrop_url,
        release_date,
        overview,
        trailer_url
      `)
      .not("backdrop_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallbackError || !fallbackMovies) {
      console.error("Error fetching fallback movies:", fallbackError);
      return [];
    }

    // Get average ratings for fallback movies
    return Promise.all(
      fallbackMovies.map(async (movie) => {
        const { data: ratingData } = await supabase
          .from("ratings")
          .select("score")
          .eq("movie_id", movie.id);

        const scores = ratingData?.map((r) => r.score).filter((s): s is number => s !== null) || [];
        const average_rating =
          scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length) / 2
            : null;

        return { ...movie, average_rating };
      })
    );
  }

  // Fetch movie details for trending movies (must have backdrop for hero)
  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select(`
      id,
      title,
      slug,
      poster_url,
      backdrop_url,
      release_date,
      overview,
      trailer_url
    `)
    .in("id", sortedMovieIds)
    .not("backdrop_url", "is", null);

  if (moviesError || !movies) {
    console.error("Error fetching trending movies:", moviesError);
    return [];
  }

  // Get average ratings and maintain the trending sort order
  const moviesWithRatings = await Promise.all(
    movies.map(async (movie) => {
      const { data: ratingData } = await supabase
        .from("ratings")
        .select("score")
        .eq("movie_id", movie.id);

      const scores = ratingData?.map((r) => r.score).filter((s): s is number => s !== null) || [];
      const average_rating =
        scores.length > 0
          ? (scores.reduce((a, b) => a + b, 0) / scores.length) / 2
          : null;

      return {
        ...movie,
        average_rating,
        trendingRank: sortedMovieIds.indexOf(movie.id),
      };
    })
  );

  // Sort by trending rank (based on rating count in last 7 days)
  return moviesWithRatings
    .sort((a, b) => a.trendingRank - b.trendingRank)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ trendingRank: _unused, ...movie }) => movie);
}

/**
 * Fetch recommended movies (based on high ratings)
 * Returns movies sorted by highest average rating (all time)
 */
export async function getRecommendedMovies(
  limit: number = 10
): Promise<RecommendedMovie[]> {
  const supabase = await createServerClient();

  // Fetch all ratings and calculate averages in memory
  // This is more efficient than making N+1 queries
  const { data: allRatings, error: ratingsError } = await supabase
    .from("ratings")
    .select("movie_id, score");

  if (ratingsError) {
    console.error("Error fetching ratings:", ratingsError);
    return [];
  }

  // Calculate average rating per movie
  const movieRatings = new Map<string, { total: number; count: number }>();
  allRatings?.forEach((rating) => {
    const current = movieRatings.get(rating.movie_id) || { total: 0, count: 0 };
    current.total += rating.score;
    current.count += 1;
    movieRatings.set(rating.movie_id, current);
  });

  // Sort movies by average rating (descending), then by count for ties
  const sortedMovieIds = Array.from(movieRatings.entries())
    .map(([movieId, { total, count }]) => ({
      movieId,
      average: total / count,
      count,
    }))
    .sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      return b.count - a.count;
    })
    .slice(0, limit)
    .map((m) => m.movieId);

  if (sortedMovieIds.length === 0) {
    // Fallback: return recent movies if no ratings exist
    const { data: fallbackMovies } = await supabase
      .from("movies")
      .select("id, title, slug, poster_url, release_date")
      .not("poster_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    return (fallbackMovies || []).map((m) => ({ ...m, average_rating: null }));
  }

  // Fetch movie details for the top-rated movies
  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select("id, title, slug, poster_url, release_date")
    .in("id", sortedMovieIds)
    .not("poster_url", "is", null);

  if (moviesError || !movies) {
    console.error("Error fetching movies for recommendations:", moviesError);
    return [];
  }

  // Attach average ratings and sort by the pre-calculated order
  return movies
    .map((movie) => {
      const ratingInfo = movieRatings.get(movie.id);
      const average_rating = ratingInfo
        ? (ratingInfo.total / ratingInfo.count) / 2 // Convert 1-10 to 1-5 scale
        : null;
      return {
        ...movie,
        average_rating,
        sortOrder: sortedMovieIds.indexOf(movie.id),
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ sortOrder: _unused, ...movie }) => movie);
}

/**
 * Fetch popular reviews (sorted by total engagement: upvotes + downvotes)
 * "Popularity" = Total vote count (likes + dislikes), regardless of vote type
 * A review with 50 dislikes is more "popular" than one with 1 like
 * Note: Reviews no longer contain ratings. Ratings are in the separate `ratings` table.
 * @param currentUserId - Optional current user ID to check their vote status
 */
export async function getPopularReviews(
  limit: number = 6,
  currentUserId?: string | null
): Promise<PopularReview[]> {
  const supabase = await createServerClient();

  // Get vote counts for all reviews at once (more efficient)
  const { data: allVotes } = await supabase
    .from("review_votes")
    .select("review_id, is_upvote");

  // Build a map of review_id -> { upvotes, downvotes, total }
  const voteCountMap = new Map<string, { upvotes: number; downvotes: number; total: number }>();
  allVotes?.forEach((vote) => {
    const current = voteCountMap.get(vote.review_id) || { upvotes: 0, downvotes: 0, total: 0 };
    if (vote.is_upvote) {
      current.upvotes++;
    } else {
      current.downvotes++;
    }
    current.total++;
    voteCountMap.set(vote.review_id, current);
  });

  // Sort review IDs by total engagement and get top ones
  const topReviewIds = Array.from(voteCountMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit)
    .map(([reviewId]) => reviewId);

  // If we have reviews with votes, fetch them directly
  // Otherwise, fall back to recent reviews
  let reviewsToEnrich: Array<{
    id: string;
    title: string | null;
    body: string | null;
    created_at: string;
    user_id: string;
    movie_id: string;
    _voteCounts: { upvotes: number; downvotes: number; total: number };
  }> = [];

  if (topReviewIds.length > 0) {
    const { data: topReviews, error } = await supabase
      .from("reviews")
      .select("id, title, body, contains_spoilers, created_at, user_id, movie_id")
      .in("id", topReviewIds)
      .not("body", "is", null);

    if (!error && topReviews) {
      reviewsToEnrich = topReviews.map((review) => ({
        ...review,
        _voteCounts: voteCountMap.get(review.id) || { upvotes: 0, downvotes: 0, total: 0 },
      }));
      // Sort by vote count
      reviewsToEnrich.sort((a, b) => b._voteCounts.total - a._voteCounts.total);
    }
  }

  // If not enough reviews with votes, supplement with recent reviews
  if (reviewsToEnrich.length < limit) {
    const existingIds = reviewsToEnrich.map((r) => r.id);
    const needed = limit - reviewsToEnrich.length;

    const { data: recentReviews } = await supabase
      .from("reviews")
      .select("id, title, body, contains_spoilers, created_at, user_id, movie_id")
      .not("body", "is", null)
      .not("id", "in", existingIds.length > 0 ? `(${existingIds.join(",")})` : "()")
      .order("created_at", { ascending: false })
      .limit(needed);

    if (recentReviews) {
      recentReviews.forEach((review) => {
        reviewsToEnrich.push({
          ...review,
          _voteCounts: voteCountMap.get(review.id) || { upvotes: 0, downvotes: 0, total: 0 },
        });
      });
    }
  }

  // Enrich with user, movie, rating (from ratings table), and counts
  const enrichedReviews = await Promise.all(
    reviewsToEnrich.slice(0, limit).map(async (review) => {
      // Get user info
      const { data: user } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", review.user_id)
        .single();

      // Get movie info (including slug for routing)
      const { data: movie } = await supabase
        .from("movies")
        .select("id, slug, title, poster_url, release_date")
        .eq("id", review.movie_id)
        .single();

      // Get user's rating for this movie from ratings table
      const { data: ratingData } = await supabase
        .from("ratings")
        .select("score")
        .eq("user_id", review.user_id)
        .eq("movie_id", review.movie_id)
        .single();

      // Get comments count
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("review_id", review.id);

      // Get current user's vote on this review (if logged in)
      let currentUserVote: "up" | "down" | null = null;
      if (currentUserId) {
        const { data: userVote } = await supabase
          .from("review_votes")
          .select("is_upvote")
          .eq("review_id", review.id)
          .eq("user_id", currentUserId)
          .single();

        if (userVote) {
          currentUserVote = userVote.is_upvote ? "up" : "down";
        }
      }

      return {
        id: review.id,
        title: review.title,
        body: review.body,
        contains_spoilers: (review as any).contains_spoilers ?? false,
        created_at: review.created_at,
        user: user || { id: "", username: "Unknown", avatar_url: null },
        movie: movie || {
          id: "",
          slug: "",
          title: "Unknown",
          poster_url: null,
          release_date: null,
        },
        user_rating: ratingData?.score ?? null, // 1-10 scale
        upvotes_count: review._voteCounts.upvotes,
        downvotes_count: review._voteCounts.downvotes,
        comments_count: commentsCount || 0,
        currentUserVote,
      };
    })
  );

  return enrichedReviews;
}

/**
 * Fetch popular lists (with most saves)
 */
export async function getPopularLists(limit: number = 6): Promise<PopularList[]> {
  const supabase = await createServerClient();

  // Calculate date 7 days ago and aggregate saves/comments in that window
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Fetch saves and comments in the last 7 days and aggregate by list_id
  const [
    { data: recentSaves, error: savesError },
    { data: recentComments, error: commentsError },
  ] = await Promise.all([
    supabase.from("list_saves").select("list_id").gte("created_at", sevenDaysAgoISO),
    supabase.from("comments").select("list_id").gte("created_at", sevenDaysAgoISO),
  ]);

  if (savesError || commentsError) {
    console.warn("Warning fetching recent saves/comments:", savesError || commentsError);
  }

  const popularityMap = new Map<string, number>();
  (recentSaves || []).forEach((s: any) => {
    const cur = popularityMap.get(s.list_id) || 0;
    popularityMap.set(s.list_id, cur + 1);
  });
  (recentComments || []).forEach((c: any) => {
    const cur = popularityMap.get(c.list_id) || 0;
    popularityMap.set(c.list_id, cur + 1);
  });

  // Instead of only selecting lists that had activity (which can be empty),
  // fetch a reasonable set of public lists and compute week popularity when
  // enriching. This guarantees we can sort by (saves + comments) in the
  // last 7 days even when some lists have zero activity.
  const CANDIDATE_FETCH_LIMIT = 200;
  const { data: candidateLists, error: candidateError } = await supabase
    .from("lists")
    .select(`
      id,
      name,
      description,
      user_id
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(CANDIDATE_FETCH_LIMIT);

  if (candidateError || !candidateLists) {
    console.error("Error fetching candidate lists for popularity computation:", candidateError);
    return [];
  }

  const listsToEnrich = candidateLists;

  // Enrich with user, posters, counts and the week popularity metric
  const enrichedLists = await Promise.all(
    listsToEnrich.map(async (list) => {
      // Get user info
      const { data: user } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", list.user_id)
        .single();

      // Get list items with movie posters
      const { data: listItems } = await supabase
        .from("list_items")
        .select(`
          movie_id,
          movies (poster_url, slug)
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

      // Get save count (all time)
      const { count: saveCount } = await supabase
        .from("list_saves")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      // Get item count
      const { count: itemCount } = await supabase
        .from("list_items")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      // Count saves in last 7 days
      const { count: weekSaveCount } = await supabase
        .from("list_saves")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id)
        .gte("created_at", sevenDaysAgoISO);

      // Count comments in last 7 days
      const { count: weekCommentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id)
        .gte("created_at", sevenDaysAgoISO);

      const weekPopularity = (weekSaveCount || 0) + (weekCommentsCount || 0);

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        user: user || { id: "", username: "Unknown", avatar_url: null },
        movie_posters: moviePosters as { poster_url?: string | null; slug?: string | null }[],
        save_count: saveCount || 0,
        item_count: itemCount || 0,
        // The query filters to only public lists, so mark explicitly
        isPublic: true,
        weekPopularity,
      };
    })
  );

  // Sort by computed week popularity and return top `limit`
  enrichedLists.sort((a, b) => (b.weekPopularity || 0) - (a.weekPopularity || 0));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (enrichedLists || []).slice(0, limit).map(({ weekPopularity: _unused, ...rest }: any) => rest as PopularList);
}

/**
 * Fetch top-rated movies of all time
 * Ratings are stored in the `ratings` table (1-10 scale), converted to 1-5 for display
 */
export async function getTopRatedMovies(
  limit: number = 6
): Promise<TopRatedMovie[]> {
  const supabase = await createServerClient();

  // Fetch all ratings and calculate averages grouped by movie_id
  const { data: allRatings, error: ratingsError } = await supabase
    .from("ratings")
    .select("movie_id, score");

  if (ratingsError) {
    console.error("Error fetching ratings for top rated movies:", ratingsError);
    return [];
  }

  // Aggregate total and count per movie
  const movieRatings = new Map<string, { total: number; count: number }>();
  allRatings?.forEach((rating) => {
    const current = movieRatings.get(rating.movie_id) || { total: 0, count: 0 };
    current.total += rating.score;
    current.count += 1;
    movieRatings.set(rating.movie_id, current);
  });

  // Only keep movies that have at least one rating
  const sortedMovieIds = Array.from(movieRatings.entries())
    .map(([movieId, { total, count }]) => ({ movieId, average: total / count, count }))
    .sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      return b.count - a.count;
    })
    .slice(0, limit)
    .map((m) => m.movieId);

  if (sortedMovieIds.length === 0) {
    // No rated movies found
    return [];
  }

  // Fetch movie details only for the rated movies (and ensure poster exists)
  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select("id, title, slug, poster_url")
    .in("id", sortedMovieIds)
    .not("poster_url", "is", null);

  if (moviesError || !movies) {
    console.error("Error fetching movies for top rated list:", moviesError);
    return [];
  }

  // Attach average ratings and preserve the sort order
  return movies
    .map((movie) => {
      const ratingInfo = movieRatings.get(movie.id);
      const average_rating = ratingInfo ? (ratingInfo.total / ratingInfo.count) / 2 : null; // convert 1-10 to 1-5
      return {
        ...movie,
        average_rating,
        sortOrder: sortedMovieIds.indexOf(movie.id),
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ sortOrder: _unused, ...m }) => m);
}

// =============================================================================
// Auth Helper
// =============================================================================

export interface CurrentUser {
  id: string;
  username: string;
  avatar_url: string | null;
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

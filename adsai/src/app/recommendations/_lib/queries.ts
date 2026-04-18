/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";
import { getMovieRecommendations } from "@/lib/recommendation_algorithm";
import { RECOMMENDATIONS_PAGE_MIN_RATINGS } from "@/lib/recommendation_config";

export interface RecommendationMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  match_percentage: number;
  genres: string[];
}

/**
 * Fetch personalized recommendations for a user
 * Returns movies the user hasn't rated, prioritized by their taste preferences
 */
export async function getUserRecommendations(
  userId: string,
  limit: number = 20
): Promise<RecommendationMovie[]> {
  try {
    const recommendations = await getMovieRecommendations({
      userId,
      limit,
      contentWeight: 0.5, // 50/50 hybrid collaborative + content-based
      minRatings: RECOMMENDATIONS_PAGE_MIN_RATINGS,
    });

    // Compute normalized match percentage relative to the highest score
    const maxScore = Math.max(...recommendations.map((r) => r.score), 0.00001);
    const topRecommendations = recommendations.slice(0, limit);

    // Fetch additional data (ratings, genres) for these movies
    const supabase = await createServerClient();
    const movieIds = topRecommendations.map((r) => r.movieId);

    const [ratingsResult, genresResult] = await Promise.all([
      supabase.from("ratings").select("movie_id, score").in("movie_id", movieIds),
      supabase
        .from("movie_genres")
        .select("movie_id, genres(name)")
        .in("movie_id", movieIds),
    ]);

    // Build rating map
    const ratingMap = new Map<string, { total: number; count: number }>();
    ratingsResult.data?.forEach((r) => {
      const cur = ratingMap.get(r.movie_id) || { total: 0, count: 0 };
      cur.total += r.score;
      cur.count += 1;
      ratingMap.set(r.movie_id, cur);
    });

    // Build genres map
    const genresMap = new Map<string, string[]>();
    genresResult.data?.forEach((mg: any) => {
      const genres = genresMap.get(mg.movie_id) || [];
      if (mg.genres?.name) {
        genres.push(mg.genres.name);
      }
      genresMap.set(mg.movie_id, genres);
    });

    return topRecommendations.map((rec) => {
      const ratingInfo = ratingMap.get(rec.movieId);
      const average_rating = ratingInfo
        ? ratingInfo.total / ratingInfo.count / 2 // Convert 1-10 -> 1-5
        : null;
      const match_percentage = maxScore > 0 ? (rec.score / maxScore) * 100 : 0;

      return {
        id: rec.movieId,
        title: rec.title,
        slug: rec.slug || "",
        poster_url: rec.posterUrl,
        release_date: rec.releaseDate,
        average_rating,
        match_percentage,
        genres: genresMap.get(rec.movieId) || [],
      };
    });
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return [];
  }
}

/**
 * Fetch trending/popular movies for users with insufficient data
 * Returns movies sorted by average rating and number of ratings
 */
export async function getTrendingRecommendations(
  limit: number = 20
): Promise<RecommendationMovie[]> {
  const supabase = await createServerClient();

  try {
    // Get movies sorted by average rating (using ratings table)
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("ratings")
      .select("movie_id, score");

    if (ratingsError) {
      console.error("Error fetching ratings:", ratingsError);
      return [];
    }

    // Calculate average ratings per movie
    const movieStats = new Map<string, { total: number; count: number }>();
    ratingsData?.forEach((r) => {
      const stats = movieStats.get(r.movie_id) || { total: 0, count: 0 };
      stats.total += r.score;
      stats.count += 1;
      movieStats.set(r.movie_id, stats);
    });

    // Include movies with at least 1 rating (so trending can surface even
    // when there are few overall ratings). If there are no rated movies at
    // all, fall back to recent movies so the UI always has content.
    const topMovieIds = Array.from(movieStats.entries())
      .filter(([, stats]) => stats.count >= 1)
      .map(([movieId, stats]) => ({
        movieId,
        average: stats.total / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.average - a.average) // Sort by average descending
      .slice(0, limit)
      .map((item) => item.movieId);

    // If there are no rated movies at all, return a recent-movies fallback
    if (topMovieIds.length === 0) {
      const { data: fallbackMovies, error: fallbackError } = await supabase
        .from("movies")
        .select("id, title, slug, poster_url, release_date")
        .not("poster_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fallbackError || !fallbackMovies) {
        console.error("Error fetching fallback movies for trending:", fallbackError);
        return [];
      }

      return (fallbackMovies || []).map((m) => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        poster_url: m.poster_url,
        release_date: m.release_date,
        average_rating: null,
        match_percentage: 0,
        genres: [],
      }));
    }

    // Fetch movie details
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("id, title, slug, poster_url, release_date")
      .in("id", topMovieIds);

    if (moviesError || !movies) {
      console.error("Error fetching movies:", moviesError);
      return [];
    }

    // Fetch genres
    const { data: genresData } = await supabase
      .from("movie_genres")
      .select("movie_id, genres(name)")
      .in("movie_id", topMovieIds);

    const genresMap = new Map<string, string[]>();
    genresData?.forEach((mg: any) => {
      const genres = genresMap.get(mg.movie_id) || [];
      if (mg.genres?.name) {
        genres.push(mg.genres.name);
      }
      genresMap.set(mg.movie_id, genres);
    });

    // Map back to sorted order
    const results: RecommendationMovie[] = [];
    for (const id of topMovieIds) {
      const movie = movies.find((m) => m.id === id);
      if (!movie) continue;

      const stats = movieStats.get(id);
      if (!stats) continue;

      results.push({
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        poster_url: movie.poster_url,
        release_date: movie.release_date,
        average_rating: stats.total / stats.count / 2, // Convert 1-10 -> 1-5
        match_percentage: 0, // No personalization for fallback
        genres: genresMap.get(movie.id) || [],
      });
    }

    return results;
  } catch (error) {
    console.error("Error in getTrendingRecommendations:", error);
    return [];
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Get user's rating count
 */
export async function getUserRatingCount(userId: string): Promise<number> {
  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from("ratings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user rating count:", error);
    return 0;
  }

  return count || 0;
}

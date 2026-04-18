import { createServerClient as createSupabaseServerClient } from './supabase/server-client';

// Types
interface MovieRecommendation {
  movieId: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  releaseDate: string | null;
  overview: string | null;
  score: number;
  contentScore: number;
  collaborativeScore: number;
  reason: string;
  isPopularFallback?: boolean;
}

interface RecommendationParams {
  userId?: string;
  limit?: number;
  contentWeight?: number;  // 0-1, how much to weight content-based vs collaborative
  minRatings?: number;     // Minimum ratings user needs to have for recommendations
}

interface CollaborativeScore {
  movie_id: string;
  predicted_score: number;
  neighbor_count: number;
}

interface ContentScore {
  movie_id: string;
  content_score: number;
  genre_match_count: number;
  actor_match_count: number;
}

interface MovieScores {
  contentScore: number;
  collaborativeScore: number;
  neighborCount: number;
  genreMatches: number;
  actorMatches: number;
}

interface HybridScore extends MovieScores {
  movieId: string;
  hybridScore: number;
}

/**
 * Generate movie recommendations for a user using hybrid approach
 */
export async function getMovieRecommendations({
  userId,
  limit = 20,
  contentWeight = 0.5, // 50/50 split by default
  minRatings = 3
}: RecommendationParams): Promise<MovieRecommendation[]> {
  // create a server supabase client for each call (handles cookies/context)
  const supabase = await createSupabaseServerClient();
  
  // Resolve effective user id: prefer explicit param, otherwise try to read from session
  let effectiveUserId: string | undefined = userId;
  if (!effectiveUserId) {
    try {
      const userResp = await supabase.auth.getUser();
      const authUser = userResp?.data?.user;
      const authErr = userResp?.error;
      if (authErr) {
        // If we can't read session, fall back to popular movies
        return getPopularMovies(supabase, limit, undefined);
      }
      if (!authUser) {
        // Not authenticated — return popular movies
        return getPopularMovies(supabase, limit, undefined);
      }
      effectiveUserId = authUser.id;
    } catch {
      return getPopularMovies(supabase, limit, undefined);
    }
  }

  // 1. Check if user has enough ratings
  const { data: userRatings, error: ratingsError } = await supabase
    .from('ratings')
    .select('movie_id')
    .eq('user_id', effectiveUserId);

  if (ratingsError) throw ratingsError;

  if (!userRatings || userRatings.length < minRatings) {
    // Fall back to popular movies if user has insufficient data
    return getPopularMovies(supabase, limit, effectiveUserId);
  }

  // 2. Get collaborative filtering scores
  const { data: collaborativeData, error: collabError } = await supabase
    .from('collaborative_scores')
    .select('movie_id, predicted_score, neighbor_count')
    .eq('user_id', effectiveUserId)
    .order('predicted_score', { ascending: false })
    .limit(100); // Get top 100 for merging

  if (collabError) throw collabError;

  // 3. Get content-based filtering scores
  const { data: contentData, error: contentError } = await supabase
    .from('content_based_scores')
    .select('movie_id, content_score, genre_match_count, actor_match_count')
    .eq('user_id', effectiveUserId)
    .order('content_score', { ascending: false })
    .limit(100); // Get top 100 for merging

  if (contentError) throw contentError;

  // 4. Merge and normalize scores
  const movieScores = new Map<string, MovieScores>();

  // Normalize collaborative scores (0-10 scale)
  const maxCollabScore = Math.max(...((collaborativeData as CollaborativeScore[])?.map(d => d.predicted_score) || [1]));
  (collaborativeData as CollaborativeScore[])?.forEach(item => {
    const normalizedScore = (item.predicted_score / maxCollabScore) * 10;
    movieScores.set(item.movie_id, {
      contentScore: 0,
      collaborativeScore: normalizedScore,
      neighborCount: item.neighbor_count,
      genreMatches: 0,
      actorMatches: 0
    });
  });

  // Normalize content scores (0-10 scale)
  const maxContentScore = Math.max(...((contentData as ContentScore[])?.map(d => d.content_score) || [1]));
  (contentData as ContentScore[])?.forEach(item => {
    const normalizedScore = (item.content_score / maxContentScore) * 10;
    const existing = movieScores.get(item.movie_id);
    if (existing) {
      existing.contentScore = normalizedScore;
      existing.genreMatches = item.genre_match_count;
      existing.actorMatches = item.actor_match_count;
    } else {
      movieScores.set(item.movie_id, {
        contentScore: normalizedScore,
        collaborativeScore: 0,
        neighborCount: 0,
        genreMatches: item.genre_match_count,
        actorMatches: item.actor_match_count
      });
    }
  });

  // 5. Calculate hybrid scores
  const hybridScores: HybridScore[] = Array.from(movieScores.entries()).map(([movieId, scores]) => {
    const collabWeight = 1 - contentWeight;
    const hybridScore = (scores.contentScore * contentWeight) + 
                       (scores.collaborativeScore * collabWeight);
    
    return {
      movieId,
      hybridScore,
      ...scores
    };
  });

  // Sort by hybrid score
  hybridScores.sort((a, b) => b.hybridScore - a.hybridScore);

  // Filter out movies the user has already rated
  let candidateScores = hybridScores;
  if (effectiveUserId) {
    try {
      const { data: userRated } = await supabase
        .from('ratings')
        .select('movie_id')
        .eq('user_id', effectiveUserId);

      if (userRated) {
        const ratedSet = new Set(userRated.map(r => r.movie_id));
        candidateScores = candidateScores.filter(s => !ratedSet.has(s.movieId));
      }
    } catch (err) {
      console.warn('Could not filter rated movies:', err);
    }
  }

  // 6. Fetch movie details for top recommendations (take extra in case some are missing data)
  const topMovieIds = candidateScores.slice(0, limit * 3).map(s => s.movieId);
  
  if (topMovieIds.length === 0) {
    // No candidates after filtering - fall back to popular movies
    return getPopularMovies(supabase, limit, effectiveUserId);
  }

  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      slug,
      poster_url,
      release_date,
      overview,
      movie_genres (
        genres (name)
      ),
      movie_credits (
        people (name),
        role
      )
    `)
    .in('id', topMovieIds);

  if (moviesError) throw moviesError;

  // 7. Build final recommendations with explanations
  const recommendations: MovieRecommendation[] = candidateScores
    .map(score => {
      const movie = movies?.find(m => m.id === score.movieId);
      if (!movie) return null;

      // Generate reason
      const reasons: string[] = [];
      if (score.collaborativeScore > 5 && score.neighborCount >= 2) {
        reasons.push(`Similar users rated this ${score.collaborativeScore.toFixed(1)}/10`);
      }
      if (score.genreMatches > 0) {
        reasons.push(`Matches ${score.genreMatches} of your favorite genres`);
      }
      if (score.actorMatches > 0) {
        reasons.push(`Features ${score.actorMatches} actors you like`);
      }

      return {
        movieId: movie.id,
        title: movie.title,
        slug: movie.slug,
        posterUrl: movie.poster_url,
        releaseDate: movie.release_date,
        overview: movie.overview,
        score: score.hybridScore,
        contentScore: score.contentScore,
        collaborativeScore: score.collaborativeScore,
        reason: reasons.join(' • ') || 'Recommended for you'
      };
    })
    .filter((r): r is MovieRecommendation => r !== null)
    .slice(0, limit);

  // If we still don't have enough recommendations after filtering, supplement with popular movies
  if (recommendations.length < limit) {
    const popularMovies = await getPopularMovies(supabase, limit - recommendations.length, effectiveUserId);
    recommendations.push(...popularMovies);
  }

  return recommendations;
}

/**
 * Fallback: Get popular movies for new users
 * Guarantees to return up to `limit` movies
 */
async function getPopularMovies(
  supabaseClient: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  limit: number,
  userId?: string
): Promise<MovieRecommendation[]> {
  const { data, error } = await supabaseClient
    .from('movies')
    .select(`
      id,
      title,
      slug,
      poster_url,
      release_date,
      overview,
      ratings (score)
    `)
    .not('ratings', 'is', null)
    .limit(limit * 3); // Get more to filter

  if (error) throw error;

  // Calculate average ratings
  interface MovieWithScores {
    id: string;
    title: string;
    slug: string;
    poster_url: string | null;
    release_date: string | null;
    overview: string | null;
    avgScore: number;
    ratingCount: number;
  }

  const moviesWithScores = data
    ?.map((movie): MovieWithScores | null => {
      const ratings = movie.ratings as { score: number }[];
      if (!ratings || ratings.length === 0) return null;
      
      const avgScore = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
      const ratingCount = ratings.length;
      
      // Bayesian average to handle movies with few ratings
      const minRatings = 5;
      const globalAvg = 7.0;
      const bayesianAvg = (avgScore * ratingCount + globalAvg * minRatings) / 
                         (ratingCount + minRatings);
      
      return {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        poster_url: movie.poster_url,
        release_date: movie.release_date,
        overview: movie.overview,
        avgScore: bayesianAvg,
        ratingCount
      };
    })
    .filter((m): m is MovieWithScores => m !== null)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit);

  // Exclude movies user has already rated (only if userId provided)
  let ratedSet = new Set<string>();
  if (userId) {
    const { data: userRatedIds } = await supabaseClient
      .from('ratings')
      .select('movie_id')
      .eq('user_id', userId);

    ratedSet = new Set(userRatedIds?.map(r => r.movie_id) || []);
  }

  // Get filtered and unfiltered versions
  const filteredMovies = (moviesWithScores || []).filter(m => !ratedSet.has(m.id));
  const allMovies = moviesWithScores || [];

  // Try filtered first, but fall back to all movies if needed to meet limit
  let resultMovies: typeof allMovies = [];
  if (filteredMovies.length >= limit) {
    resultMovies = filteredMovies.slice(0, limit);
  } else {
    // Use filtered movies first, then pad with unfiltered if needed
    resultMovies = [...filteredMovies];
    const remainingNeeded = limit - filteredMovies.length;
    const unfilteredIds = new Set(filteredMovies.map(m => m.id));
    const additionalMovies = allMovies
      .filter(m => !unfilteredIds.has(m.id))
      .slice(0, remainingNeeded);
    resultMovies.push(...additionalMovies);
  }

  return resultMovies.map(movie => ({
    movieId: movie.id,
    title: movie.title,
    slug: movie.slug,
    posterUrl: movie.poster_url,
    releaseDate: movie.release_date,
    overview: movie.overview,
    score: movie.avgScore,
    contentScore: 0,
    collaborativeScore: 0,
    reason: `Popular with ${movie.ratingCount} ratings (${movie.avgScore.toFixed(1)}/10)`,
    isPopularFallback: true,
  }));
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";

export type SortOption =
  | "popularity.desc"
  | "rating.desc"
  | "release_date.desc"
  | "release_date.asc"
  | "title.asc"
  | "title.desc"

export interface MovieListItem {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  review_count?: number;
  rating_count?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface WatchlistPageData {
  movies: MovieListItem[];
  totalCount: number;
  genres: Genre[];
  yearRange: { min: number; max: number };
}

export interface MoviesFilterParams {
  page?: number;
  limit?: number;
  genres?: number[];
  yearMin?: number;
  yearMax?: number;
  sortBy?: SortOption;
  search?: string;
}

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * * Resolves a user ID from a provided parameter.
 *  *
 *  * @param {string} param - The parameter to resolve the user ID from.
 *  * @returns {string|null} The resolved user ID, or null if an error occurs.
 */
export async function resolveUserIdFromParam(param: string) {
  const supabase = await createServerClient();

  if (UUID_RE.test(param)) return param;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", param)
    .maybeSingle();

  if (error) {
    console.error("Error resolving username -> id:", error);
    return null;
  }

  return (data as any)?.id ?? null;
}

/**
 * Fetch genres and year range from global movie tables (reuse the same info as movies page)
 */
async function getGlobalGenres() {
  const supabase = await createServerClient();
  const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true });
  return (genres as Genre[]) || [];
}

async function getGlobalYearRange() {
  const supabase = await createServerClient();
  const currentYear = new Date().getFullYear();

  const { data: oldest } = await supabase
    .from("movies")
    .select("release_date")
    .not("release_date", "is", null)
    .order("release_date", { ascending: true })
    .limit(1)
    .single();

  const { data: newest } = await supabase
    .from("movies")
    .select("release_date")
    .not("release_date", "is", null)
    .order("release_date", { ascending: false })
    .limit(1)
    .single();

  const minYear = oldest?.release_date ? new Date(oldest.release_date).getFullYear() : 1900;
  const maxYear = newest?.release_date ? new Date(newest.release_date).getFullYear() : currentYear;

  return { min: minYear, max: maxYear };
}

/**
 * Fetch watchlist movies for a given user id applying the same basic filters and sorting
 */
export async function getWatchlistPageData(userId: string, params: MoviesFilterParams = {}): Promise<WatchlistPageData> {
  const { page = 1, limit = 20, genres = [], yearMin, yearMax, sortBy = "popularity.desc", search } = params;
  const supabase = await createServerClient();
  const offset = (page - 1) * limit;

  // First, fetch movie ids on the user's watchlist
  const { data: watchItems, error: watchError } = await supabase
    .from("watchlist")
    .select("movie_id")
    .eq("user_id", userId);

  if (watchError) {
    console.error("Error fetching watchlist items:", watchError);
    return { movies: [], totalCount: 0, genres: [], yearRange: { min: 1900, max: new Date().getFullYear() } };
  }

  const movieIds = (watchItems || []).map((r: any) => r.movie_id);

  if (movieIds.length === 0) {
    const [genresList, yrRange] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
    return { movies: [], totalCount: 0, genres: genresList, yearRange: yrRange };
  }

  // Determine basic sorting
  let orderColumn = "created_at";
  let orderAscending = false;
  switch (sortBy) {
    case "release_date.desc":
      orderColumn = "release_date";
      orderAscending = false;
      break;
    case "release_date.asc":
      orderColumn = "release_date";
      orderAscending = true;
      break;
    case "title.asc":
      orderColumn = "title";
      orderAscending = true;
      break;
    case "title.desc":
      orderColumn = "title";
      orderAscending = false;
      break;
    case "rating.desc":
    case "popularity.desc":
    default:
      orderColumn = "created_at";
      orderAscending = false;
      break;
  }

  // Helper to fetch average ratings for a list
  async function fetchRatingsForMovies(movies: MovieListItem[]) {
    const BATCH_SIZE = 50;
    const results: MovieListItem[] = [];

    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
      const batch = movies.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (movie) => {
          const { data: ratingData } = await supabase.from("ratings").select("score").eq("movie_id", movie.id);
          const scores = ratingData?.map((r: any) => r.score).filter((s: any): s is number => s != null) || [];
          const average_rating = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) / 2 : null;
          return { ...movie, average_rating };
        })
      );
      results.push(...batchResults);
    }

    return results;
  }

  // Main query paths: if genres specified, we need to go through movie_genres
  if (genres.length > 0) {
    const { data: movieGenresData, error: genreError } = await supabase
      .from("movie_genres")
      .select(`
        movie_id,
        movies!inner (
          id,
          title,
          slug,
          poster_url,
          release_date
        )
      `)
      .in("genre_id", genres)
      .in("movie_id", movieIds);

    if (genreError) {
      console.error("Error fetching watchlist movies by genre:", genreError);
      return { movies: [], totalCount: 0, genres: [], yearRange: await getGlobalYearRange() };
    }

    if (!movieGenresData || movieGenresData.length === 0) {
      const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
      return { movies: [], totalCount: 0, genres: g, yearRange: yr };
    }

    const unique = new Map<string, MovieListItem>();
    for (const mg of movieGenresData) {
      const movie = (mg as any).movies;
      if (!movie) continue;
      if (search && !movie.title.toLowerCase().includes(search.toLowerCase())) continue;
      if (yearMin && movie.release_date && movie.release_date < `${yearMin}-01-01`) continue;
      if (yearMax && movie.release_date && movie.release_date > `${yearMax}-12-31`) continue;

      if (!unique.has(movie.id)) {
        unique.set(movie.id, {
          id: movie.id,
          title: movie.title,
          slug: movie.slug,
          poster_url: movie.poster_url,
          release_date: movie.release_date,
          average_rating: null,
        });
      }
    }

    const filteredMovies = Array.from(unique.values());
    const totalCount = filteredMovies.length;

    const MAX_MOVIES_FOR_SORTING = 500;
    if (sortBy === "rating.desc" || sortBy === "popularity.desc") {
      const moviesToProcess = filteredMovies.slice(0, MAX_MOVIES_FOR_SORTING);
      // fetch ratings and review counts
      const moviesWithStats = [] as MovieListItem[];
      for (const m of moviesToProcess) {
        const { data: ratingData } = await supabase.from("ratings").select("score").eq("movie_id", m.id);
        const { count: reviewCount } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("movie_id", m.id);
        const scores = ratingData?.map((r: any) => r.score).filter((s: any): s is number => s != null) || [];
        const average_rating = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) / 2 : null;
        const ratingCount = ratingData?.length || 0;
        moviesWithStats.push({ ...m, average_rating, review_count: reviewCount || 0, rating_count: ratingCount });
      }

      if (sortBy === "rating.desc") {
        moviesWithStats.sort((a, b) => {
          if (a.average_rating === null && b.average_rating === null) return 0;
          if (a.average_rating === null) return 1;
          if (b.average_rating === null) return -1;
          return (b.average_rating as number) - (a.average_rating as number);
        });
      } else {
        // popularity = review_count + rating_count
        moviesWithStats.sort((a, b) => {
          const popA = (a.review_count || 0) + (a.rating_count || 0);
          const popB = (b.review_count || 0) + (b.rating_count || 0);
          return popB - popA;
        });
      }

      const paged = moviesWithStats.slice(offset, offset + limit);
      const effectiveTotal = Math.min(totalCount, MAX_MOVIES_FOR_SORTING);
      const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
      return { movies: paged, totalCount: effectiveTotal, genres: g, yearRange: yr };
    }

    // Other sorts (release_date), sort locally then paginate
    filteredMovies.sort((a, b) => {
      if (orderColumn === "release_date") {
        const dateA = a.release_date || "";
        const dateB = b.release_date || "";
        return orderAscending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
      if (orderColumn === "title") {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return orderAscending ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      }
      return orderAscending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });

    const paginated = filteredMovies.slice(offset, offset + limit);
    const moviesWithRatings = await fetchRatingsForMovies(paginated);
    const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);

    return { movies: moviesWithRatings, totalCount, genres: g, yearRange: yr };
  }

  // No genre filter - standard path
  if (sortBy === "rating.desc" || sortBy === "popularity.desc") {
    const MAX_MOVIES_FOR_SORTING = 500;

    let query = supabase
      .from("movies")
      .select(`id, title, slug, poster_url, release_date`, { count: "exact" })
      .in("id", movieIds)
      .limit(MAX_MOVIES_FOR_SORTING);

    if (search) query = query.ilike("title", `%${search}%`);
    if (yearMin) query = query.gte("release_date", `${yearMin}-01-01`);
    if (yearMax) query = query.lte("release_date", `${yearMax}-12-31`);

    const { data: allMovies, error: allError, count: allCount } = await query;
    if (allError) {
      console.error("Error fetching watchlist movies:", allError);
      return { movies: [], totalCount: 0, genres: [], yearRange: await getGlobalYearRange() };
    }

    if (!allMovies || allMovies.length === 0) {
      const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
      return { movies: [], totalCount: allCount || 0, genres: g, yearRange: yr };
    }

    const moviesList: MovieListItem[] = (allMovies as any[]).map((m) => ({ ...m, average_rating: null }));

    // fetch ratings and review counts
    const moviesWithStats = [] as MovieListItem[];
    for (const m of moviesList) {
      const { data: ratingData } = await supabase.from("ratings").select("score").eq("movie_id", m.id);
      const { count: reviewCount } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("movie_id", m.id);
      const scores = ratingData?.map((r: any) => r.score).filter((s: any): s is number => s != null) || [];
      const average_rating = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) / 2 : null;
      const ratingCount = ratingData?.length || 0;
      moviesWithStats.push({ ...m, average_rating, review_count: reviewCount || 0, rating_count: ratingCount });
    }

    if (sortBy === "rating.desc") {
      moviesWithStats.sort((a, b) => {
        if (a.average_rating === null && b.average_rating === null) return 0;
        if (a.average_rating === null) return 1;
        if (b.average_rating === null) return -1;
        return (b.average_rating as number) - (a.average_rating as number);
      });
    } else {
      // popularity = review_count + rating_count
      moviesWithStats.sort((a, b) => {
        const popA = (a.review_count || 0) + (a.rating_count || 0);
        const popB = (b.review_count || 0) + (b.rating_count || 0);
        return popB - popA;
      });
    }

    const paged = moviesWithStats.slice(offset, offset + limit);
    const effectiveTotal = Math.min(allCount || 0, MAX_MOVIES_FOR_SORTING);
    const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
    return { movies: paged, totalCount: effectiveTotal, genres: g, yearRange: yr };
  }

  // release_date sorts and default path: DB-level sorting and pagination
  let query = supabase
    .from("movies")
    .select(`id, title, slug, poster_url, release_date`, { count: "exact" })
    .in("id", movieIds);

  if (search) query = query.ilike("title", `%${search}%`);
  if (yearMin) query = query.gte("release_date", `${yearMin}-01-01`);
  if (yearMax) query = query.lte("release_date", `${yearMax}-12-31`);

  query = query.order(orderColumn, { ascending: orderAscending, nullsFirst: false }).range(offset, offset + limit - 1);

  const { data: movies, error, count } = await query;
  if (error) {
    console.error("Error fetching watchlist movies (release_date path):", error);
    return { movies: [], totalCount: 0, genres: [], yearRange: await getGlobalYearRange() };
  }

  if (!movies || movies.length === 0) {
    const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
    return { movies: [], totalCount: count || 0, genres: g, yearRange: yr };
  }

  const moviesList: MovieListItem[] = (movies as any[]).map((m) => ({ ...m, average_rating: null }));
  const moviesWithRatings = await (async () => {
    const BATCH_SIZE = 50;
    const res: MovieListItem[] = [];
    for (let i = 0; i < moviesList.length; i += BATCH_SIZE) {
      const batch = moviesList.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (movie) => {
          const { data: ratingData } = await supabase.from("ratings").select("score").eq("movie_id", movie.id);
          const scores = ratingData?.map((r: any) => r.score).filter((s: any): s is number => s != null) || [];
          const average_rating = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) / 2 : null;
          return { ...movie, average_rating };
        })
      );
      res.push(...batchResults);
    }
    return res;
  })();

  const [g, yr] = await Promise.all([getGlobalGenres(), getGlobalYearRange()]);
  return { movies: moviesWithRatings, totalCount: count || 0, genres: g, yearRange: yr };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";

export type SortOption =
  | "popularity.desc"
  | "rating.desc"
  | "release_date.desc"
  | "release_date.asc"
  | "title.asc"
  | "title.desc";

export interface MovieListItem {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  review_count?: number;
  user_rating?: number; // The rating this specific user gave
}

export interface Genre {
  id: number;
  name: string;
}

export interface RatingsPageData {
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

// Type for the RPC function return
interface UserRatedMovieRow {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  rating_count: number;
  review_count: number;
  user_rating: number;
  total_count: number;
}

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * * Resolves a user ID from a provided parameter.
 *  *
 *  * @param {string} param - The parameter to resolve the user ID from.
 *  * @returns {string|null} The resolved user ID, or null if an error occurs or no match is found.
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

  return data?.id ?? null;
}

async function getGlobalGenres(): Promise<Genre[]> {
  const supabase = await createServerClient();
  const { data: genres } = await supabase
    .from("genres")
    .select("id, name")
    .order("name", { ascending: true });
  return genres || [];
}

async function getGlobalYearRange(): Promise<{ min: number; max: number }> {
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

  const minYear = oldest?.release_date
    ? new Date(oldest.release_date).getFullYear()
    : 1900;

  const maxYear = newest?.release_date
    ? new Date(newest.release_date).getFullYear()
    : currentYear;

  return { min: minYear, max: maxYear };
}

/**
 * Fetch movies the user has rated applying filters, sorting and pagination
 */
export async function getRatingsPageData(
  userId: string,
  params: MoviesFilterParams = {}
): Promise<RatingsPageData> {
  const {
    page = 1,
    limit = 20,
    genres = [],
    yearMin,
    yearMax,
    sortBy = "popularity.desc",
    search,
  } = params;

  const supabase = await createServerClient();
  const offset = (page - 1) * limit;

  // Use the RPC function for efficient querying
  const { data, error } = await supabase.rpc('get_user_rated_movies_filtered', {
    p_user_id: userId,
    p_genre_ids: genres.length > 0 ? genres : null,
    p_year_min: yearMin || null,
    p_year_max: yearMax || null,
    p_search: search || null,
    p_sort_by: sortBy,
    p_limit: limit,
    p_offset: offset,
  }) as { data: UserRatedMovieRow[] | null; error: any };

  if (error) {
    console.error("Error fetching user rated movies:", error);
    // Still fetch genres and year range for the UI
    const [genresList, yrRange] = await Promise.all([
      getGlobalGenres(),
      getGlobalYearRange(),
    ]);
    return {
      movies: [],
      totalCount: 0,
      genres: genresList,
      yearRange: yrRange,
    };
  }

  if (!data || data.length === 0) {
    const [genresList, yrRange] = await Promise.all([
      getGlobalGenres(),
      getGlobalYearRange(),
    ]);
    return {
      movies: [],
      totalCount: 0,
      genres: genresList,
      yearRange: yrRange,
    };
  }

  // Extract total count from first row
  const totalCount = data[0]?.total_count || 0;

  // Map to MovieListItem format
  const movies: MovieListItem[] = data.map((row: UserRatedMovieRow) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    poster_url: row.poster_url,
    release_date: row.release_date,
    average_rating: row.average_rating ? Number(row.average_rating) : null,
    rating_count: row.rating_count,
    review_count: row.review_count,
    user_rating: row.user_rating, // Include the user's specific rating
  }));

  // Fetch genres and year range in parallel
  const [genresList, yrRange] = await Promise.all([
    getGlobalGenres(),
    getGlobalYearRange(),
  ]);

  return {
    movies,
    totalCount: Number(totalCount),
    genres: genresList,
    yearRange: yrRange,
  };
}
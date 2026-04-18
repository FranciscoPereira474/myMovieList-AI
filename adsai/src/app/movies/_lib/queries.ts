/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { createServerClient } from "@/lib/supabase/server-client";

// =============================================================================
// Type Definitions
// =============================================================================

export interface Genre {
  id: number;
  name: string;
}

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

interface MovieStatsRow {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_date: string | null;
  average_rating: number | null;
  rating_count: number;
  review_count: number;
  total_count: number;
}

export interface MoviesPageData {
  movies: MovieListItem[];
  totalCount: number;
  genres: Genre[];
  yearRange: { min: number; max: number };
}

export type SortOption = 
  | "popularity.desc" 
  | "rating.desc" 
  | "release_date.desc" 
  | "release_date.asc"
  | "title.asc"
  | "title.desc";

export interface MoviesFilterParams {
  page?: number;
  limit?: number;
  genres?: number[];
  yearMin?: number;
  yearMax?: number;
  sortBy?: SortOption;
  search?: string;
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Fetch all genres for the filter sidebar
 */
export async function getGenres(): Promise<Genre[]> {
  const supabase = await createServerClient();

  const { data: genres, error } = await supabase
    .from("genres")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching genres:", error);
    return [];
  }

  return genres || [];
}

/**
 * Fetch the year range (oldest and newest movie release dates)
 */
export async function getYearRange(): Promise<{ min: number; max: number }> {
  const supabase = await createServerClient();
  const currentYear = new Date().getFullYear();

  // Get the oldest movie
  const { data: oldest } = await supabase
    .from("movies")
    .select("release_date")
    .not("release_date", "is", null)
    .order("release_date", { ascending: true })
    .limit(1)
    .single();

  // Get the newest movie
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
 * Fetch movies with filters and pagination
 */
export async function getMovies(
  params: MoviesFilterParams = {}
): Promise<{ movies: MovieListItem[]; totalCount: number }> {
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
  const { data, error } = await supabase.rpc('get_movies_filtered', {
    p_genre_ids: genres.length > 0 ? genres : null,
    p_year_min: yearMin || null,
    p_year_max: yearMax || null,
    p_search: search || null,
    p_sort_by: sortBy,
    p_limit: limit,
    p_offset: offset,
  }) as { data: MovieStatsRow[] | null; error: any };

  if (error) {
    console.error("Error fetching movies:", error);
    return { movies: [], totalCount: 0 };
  }

  if (!data || data.length === 0) {
    return { movies: [], totalCount: 0 };
  }

  const totalCount = data[0]?.total_count || 0;
  

  // Default path: RPC handled ordering/pagination; map rows to items
  const movies: MovieListItem[] = data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    poster_url: row.poster_url,
    release_date: row.release_date,
    average_rating: row.average_rating ? Number(row.average_rating) : null,
    rating_count: row.rating_count || 0,
    review_count: row.review_count || 0,
  }));

  return {
    movies,
    totalCount: Number(totalCount),
  };
}

/**
 * Get movies page data with all necessary information
 */
export async function getMoviesPageData(
  params: MoviesFilterParams = {}
): Promise<MoviesPageData> {
  const [moviesResult, genres, yearRange] = await Promise.all([
    getMovies(params),
    getGenres(),
    getYearRange(),
  ]);

  return {
    movies: moviesResult.movies,
    totalCount: moviesResult.totalCount,
    genres,
    yearRange,
  };
}

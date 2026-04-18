"use client";

import * as React from "react";
import { MovieCard } from "@/components/ui/movie-card";
import type { MovieListItem } from "../_lib/queries";

interface MoviesGridProps {
  movies: MovieListItem[];
}

/**
 * * Renders a grid of movie cards.
 *  *
 *  * @param {MoviesGridProps} props - The component's properties.
 *  * @returns {JSX.Element} The JSX element representing the grid of movie cards.
 *  
 * export function MoviesGrid({ movies }: MoviesGridProps) {
 *   return (
 *     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
 *       {movies.map((movie) => (
 *         <MovieCard
 *           key={movie.id}
 *           title={movie.title}
 *           posterUrl={movie.poster_url || "/placeholder-poster.jpg"}
 *           rating={movie.average_rating ?? undefined}
 *           year={movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
 *           variant="compact"
 *           href={`/movies/${movie.slug}`}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 */
export function MoviesGrid({ movies }: MoviesGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          title={movie.title}
          posterUrl={movie.poster_url || "/placeholder-poster.jpg"}
          rating={movie.average_rating ?? undefined}
          year={movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          variant="compact"
          href={`/movies/${movie.slug}`}
        />
      ))}
    </div>
  );
}

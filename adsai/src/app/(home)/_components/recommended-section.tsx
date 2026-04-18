"use client";

import {
  SectionHeader,
  MovieCarousel,
  MovieCard,
} from "@/components/ui";
import { useQuickView } from "@/context/quick-view-modal";
import type { RecommendedMovie } from "../_lib/queries";

interface RecommendedSectionProps {
  movies: RecommendedMovie[];
}

/**
 * * Renders a recommended section with a movie carousel.
 *  *
 *  * @param {RecommendedSectionProps} props - The properties for the recommended section.
 *  * @returns {JSX.Element|null} The rendered recommended section, or null if no movies are provided.
 */
export function RecommendedSection({ movies }: RecommendedSectionProps) {
  const { open } = useQuickView();

  if (movies.length === 0) {
    return null;
  }

  // Detect if results are the popular-movies fallback
  const isPopularFallback = movies.every((m) => !!m.is_popular_fallback);

  return (
    <section>
      <SectionHeader
        title={isPopularFallback ? "Popular Movies" : "Recommended for You"}
        viewAllHref={isPopularFallback ? "/movies" : "/recommendations"}
      />

      <MovieCarousel>
        {movies.map((movie) => {
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "—";

          return (
            <MovieCard
              key={movie.id}
              title={movie.title}
              posterUrl={movie.poster_url || "/placeholder-poster.jpg"}
              year={year}
              rating={movie.average_rating ?? undefined}
              matchPercentage={!isPopularFallback ? movie.match_percentage ?? undefined : undefined}
              showRatingBadge={false}
              matchOnHover={!isPopularFallback}
              onQuickView={() => open({
                id: movie.id,
                slug: movie.slug,
                title: movie.title,
                posterUrl: movie.poster_url,
                year,
                rating: movie.average_rating ?? undefined,
                matchPercentage: !isPopularFallback ? movie.match_percentage ?? undefined : undefined,
                source: "recommended",
              })}
            />
          );
        })}
      </MovieCarousel>
    </section>
  );
}

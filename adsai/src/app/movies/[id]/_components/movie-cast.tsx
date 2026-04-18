import { CastCard } from "@/components/ui/cast-card";
import { MovieCarousel } from "@/components/ui/movie-carousel";
import type { CastMember } from "../_lib/queries";

interface MovieCastProps {
  cast: CastMember[];
  movieId: string; // used for fetching credits
  movieSlug?: string; // used for links (slug-only routing)
}

/**
 * * Renders a section with the top cast of a movie.
 *  *
 *  * @param {MovieCastProps} props - The properties passed to this component.
 *  * @param {Array} props.cast - An array of objects representing the cast members.
 *  * @param {string} props.movieSlug - The slug of the movie (optional).
 *  *
 *  * @returns {JSX.Element} The JSX element representing the top cast section.
 */
export function MovieCast({ cast, movieSlug }: MovieCastProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Top Cast</h3>
        {movieSlug ? (
          <a
            href={`/movies/${movieSlug}/cast`}
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            View All Cast
          </a>
        ) : (
          <span className="text-sm text-neutral-500">View All Cast</span>
        )}
      </div>

      <MovieCarousel gap="md" showArrows showMasks={false} loop={false}>
        {cast.map((member) => (
          <CastCard
            key={member.id}
            actor={{
              id: member.id,
              name: member.name,
              character: member.character_name || undefined,
              imageUrl: member.profile_path
                ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                : undefined,
            }}
            size="md"
          />
        ))}
      </MovieCarousel>
    </section>
  );
}

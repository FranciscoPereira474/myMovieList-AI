import Link from "next/link";
import Image from "next/image";
// Star icon is unused here; Rating display handled by StarRating component
import { StarRating } from "@/components/ui/star-rating";
import type { LoggedMovie } from "../_lib/queries";

interface RecentActivityProps {
  movies: LoggedMovie[];
  username: string;
}

/**
 * * Displays the recent activity of a user, including their last logged movies.
 *  *
 *  * @param {RecentActivityProps} props - The properties passed to this component.
 *  * @param {Movie[]} props.movies - An array of movies logged by the user.
 *  * @param {string} props.username - The username of the user.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the recent activity.
 */
export function RecentActivity({ movies, username }: RecentActivityProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <p className="text-neutral-400">@{username} hasn&apos;t logged any movies yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Last 10 Logged Movies</h2>
        <div className="text-xs text-neutral-500">Sorted by Date Watched</div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

function MovieCard({ movie }: { movie: LoggedMovie }) {
  const isHighRating = movie.rating && movie.rating >= 8;

  const content = (
    <>
      <div className="aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 relative shadow-md">
        {movie.poster_url ? (
          <Image src={movie.poster_url} alt={movie.title} fill sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw" className="object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><span className="text-neutral-500 text-xs text-center px-2">{movie.title}</span></div>
        )}

        {movie.rating && (
          <div className={`absolute top-1 right-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 flex items-center ${isHighRating ? "text-brand-400" : "text-neutral-400"}`}>
            <StarRating value={(movie.rating as number) / 2} size="xs" color="brand" showValue />
          </div>
        )}
      </div>
      <h3 className="mt-2 text-xs font-semibold text-neutral-300 truncate group-hover:text-white">{movie.title}</h3>
    </>
  );

  if (movie.slug) {
    return (
      <Link href={`/movies/${movie.slug}`} className="relative group cursor-pointer block">
        {content}
      </Link>
    );
  }

  return (
    <div className="relative group cursor-pointer block">
      {content}
    </div>
  );
}

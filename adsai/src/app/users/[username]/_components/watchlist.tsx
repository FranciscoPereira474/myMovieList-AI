import Link from "next/link";
import Image from "next/image";
import type { LoggedMovie } from "../_lib/queries";

interface WatchlistProps { movies: LoggedMovie[]; username: string }

/**
 * * Displays a user's watchlist of movies.
 *  *
 *  * @param {WatchlistProps} props - The component's properties.
 *  * @param {Object[]} props.movies - An array of movie objects.
 *  * @param {string} props.username - The username associated with the watchlist.
 *  *
 *  * @returns {JSX.Element} The JSX element representing the watchlist.
 */
export function Watchlist({ movies, username }: WatchlistProps) {
  if (movies.length === 0) {
    return (<div className="text-center py-20"><p className="text-neutral-400 text-lg">@{username}&apos;s watchlist is empty</p></div>);
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Watchlist <span className="text-neutral-500 text-lg font-normal ml-2">{movies.length}</span></h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          movie.slug ? (
            <Link key={movie.id} href={`/movies/${movie.slug}`} className="group relative">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 group-hover:border-brand-500 transition-all">
                {movie.poster_url ? <Image src={movie.poster_url} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" /> : (<div className="w-full h-full bg-neutral-800 flex items-center justify-center"><span className="text-neutral-600 text-xs">No Image</span></div>)}
              </div>
              <h3 className="mt-2 text-sm font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-2">{movie.title}</h3>
            </Link>
          ) : (
            <div key={movie.id} className="group relative">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 transition-all">
                {movie.poster_url ? <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" /> : (<div className="w-full h-full bg-neutral-800 flex items-center justify-center"><span className="text-neutral-600 text-xs">No Image</span></div>)}
              </div>
              <h3 className="mt-2 text-sm font-medium text-neutral-300 line-clamp-2">{movie.title}</h3>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

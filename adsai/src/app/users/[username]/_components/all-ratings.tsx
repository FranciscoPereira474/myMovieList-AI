import Link from "next/link";
import Image from "next/image";
import type { LoggedMovie } from "../_lib/queries";

interface AllRatingsProps { movies: LoggedMovie[]; username: string }

/**
 * * Displays all ratings for a user.
 *  *
 *  * @param {AllRatingsProps} props - The properties passed to the component.
 *  * @param {Object[]} props.movies - An array of movie objects containing rating information.
 *  * @param {string} props.username - The username of the user who has rated movies.
 *  *
 *  * @returns {JSX.Element} A JSX element representing the all ratings page for the user.
 */
export function AllRatings({ movies, username }: AllRatingsProps) {
  if (movies.length === 0) return (<div className="text-center py-20"><p className="text-neutral-400 text-lg">@{username} hasn&apos;t rated any movies yet</p></div>);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Ratings <span className="text-neutral-500 text-lg font-normal ml-2">{movies.length}</span></h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          movie.slug ? (
            <Link key={movie.id} href={`/movies/${movie.slug}`} className="group relative">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 group-hover:border-brand-500 transition-all">
                {movie.poster_url ? <Image src={movie.poster_url} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" /> : (<div className="w-full h-full bg-neutral-800 flex items-center justify-center"><span className="text-neutral-600 text-xs">No Image</span></div>)}
                {movie.rating && <div className="absolute top-2 right-2 bg-brand-500 text-black font-bold text-xs px-2 py-1 rounded-md shadow-lg">{movie.rating}/10</div>}
              </div>
              <h3 className="mt-2 text-sm font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-2">{movie.title}</h3>
            </Link>
          ) : (
            <div key={movie.id} className="group relative">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 transition-all">
                {movie.poster_url ? <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" /> : (<div className="w-full h-full bg-neutral-800 flex items-center justify-center"><span className="text-neutral-600 text-xs">No Image</span></div>)}
                {movie.rating && <div className="absolute top-2 right-2 bg-neutral-700 text-neutral-300 font-bold text-xs px-2 py-1 rounded-md">{movie.rating}/10</div>}
              </div>
              <h3 className="mt-2 text-sm font-medium text-neutral-300 line-clamp-2">{movie.title}</h3>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

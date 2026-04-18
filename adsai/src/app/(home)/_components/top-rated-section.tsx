"use client";

import Image from "next/image";
import { SectionHeader, MovieCarousel, RatingBadge } from "@/components/ui";
import { useQuickView } from "@/context/quick-view-modal";
import type { TopRatedMovie } from "../_lib/queries";

interface TopRatedSectionProps {
  movies: TopRatedMovie[];
}

/**
 * * Renders the Top Rated Section component.
 *  *
 *  * @param {TopRatedSectionProps} props - The properties for the Top Rated Section component.
 *  * @returns {JSX.Element|null} The JSX element representing the Top Rated Section, or null if no movies are available.
 *  
 * export function TopRatedSection({ movies }: TopRatedSectionProps) {
 *   if (movies.length === 0) {
 *     return null;
 *   }
 *
 *   const { open } = useQuickView();
 *
 *   return (
 *     <section>
 *       <SectionHeader
 *         title="All-Time Highest Rated"
 *         viewAllHref="/movies?sortBy=rating.desc"
 *         viewAllText="View All"
 *       />
 *
 *       <MovieCarousel>
 *         {movies.map((movie, idx) => (
 *           <div 
 *             key={movie.id} 
 *             onClick={() => open({
 *               id: movie.id,
 *               slug: movie.slug,
 *               title: movie.title,
 *               posterUrl: movie.poster_url,
 *               year: undefined,
 *               rating: movie.average_rating ?? undefined,
 *               source: "top-rated",
 *             })} 
 *             className="group cursor-pointer block" 
 *             style={{ flex: "0 0 auto", width: "160px" }}
 *           >
 *             <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-brand-500/20">
 *               <Image
 *                 src={movie.poster_url || "/placeholder-poster.jpg"}
 *                 alt={movie.title}
 *                 fill
 *                 className="object-cover w-full h-full transition duration-300 group-hover:opacity-90"
 *                 sizes="160px"
 *               />
 *               <div className="absolute inset-x-2 top-2 z-10 flex items-start justify-between">
 *                 <div className="rounded-md bg-black/60 border border-neutral-800 px-2 py-1 text-xs font-semibold text-white shadow-sm">#{idx + 1}</div>
 *                 {movie.average_rating && (
 *                   <div>
 *                     <RatingBadge score={movie.average_rating} size="sm" />
 *                   </div>
 *                 )}
 *               </div>
 *             </div>
 *             <h3 className="mt-2 text-sm font-medium text-neutral-300 truncate group-hover:text-white transition-colors">
 *               {movie.title}
 *             </h3>
 *           </div>
 *         ))}
 *       </MovieCarousel>
 *     </section>
 *   );
 * }
 */
export function TopRatedSection({ movies }: TopRatedSectionProps) {
  const { open } = useQuickView();

  if (movies.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="All-Time Highest Rated"
        viewAllHref="/movies?sortBy=rating.desc"
        viewAllText="View All"
      />

      <MovieCarousel>
        {movies.map((movie, idx) => (
          <div 
            key={movie.id} 
            onClick={() => open({
              id: movie.id,
              slug: movie.slug,
              title: movie.title,
              posterUrl: movie.poster_url,
              year: undefined,
              rating: movie.average_rating ?? undefined,
              source: "top-rated",
            })} 
            className="group cursor-pointer block" 
            style={{ flex: "0 0 auto", width: "160px" }}
          >
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-brand-500/20">
              <Image
                src={movie.poster_url || "/placeholder-poster.jpg"}
                alt={movie.title}
                fill
                className="object-cover w-full h-full transition duration-300 group-hover:opacity-90"
                sizes="160px"
              />
              <div className="absolute inset-x-2 top-2 z-10 flex items-start justify-between">
                <div className="rounded-md bg-black/60 border border-neutral-800 px-2 py-1 text-xs font-semibold text-white shadow-sm">#{idx + 1}</div>
                {movie.average_rating && (
                  <div>
                    <RatingBadge score={movie.average_rating} size="sm" />
                  </div>
                )}
              </div>
            </div>
            <h3 className="mt-2 text-sm font-medium text-neutral-300 truncate group-hover:text-white transition-colors">
              {movie.title}
            </h3>
          </div>
        ))}
      </MovieCarousel>
    </section>
  );
}

import { Suspense } from "react";
import { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoviesFilterSidebar,
  MoviesGrid,
  MoviesPagination,
  MobileFilters,
} from "./_components";
import { getMoviesPageData, type SortOption } from "./_lib/queries";

export const metadata: Metadata = {
  title: "Explore Movies | CineLog",
  description: "Discover and explore movies. Filter by genre, year, and rating.",
};

const ITEMS_PER_PAGE = 20;

interface MoviesPageProps {
  searchParams: Promise<{
    page?: string;
    genres?: string;
    yearMin?: string;
    yearMax?: string;
    sortBy?: SortOption;
    q?: string;
  }>;
}

/**
 * * MoviesPage component.
 *  *
 *  * @param {MoviesPageProps} props - Component props.
 *  * @returns {JSX.Element} The rendered MoviesPage component.
 *  
 * export default async function MoviesPage({ searchParams }: MoviesPageProps) {
 *   const params = await searchParams;
 *   
 *   const page = Number(params.page) || 1;
 *   const genres = params.genres?.split(",").map(Number).filter(Boolean) || [];
 *   const yearMin = params.yearMin ? Number(params.yearMin) : undefined;
 *   const yearMax = params.yearMax ? Number(params.yearMax) : undefined;
 *   const sortBy = params.sortBy || "popularity.desc";
 *   const search = params.q || undefined;
 *
 *   const { movies, totalCount, genres: allGenres, yearRange } = await getMoviesPageData({
 *     page,
 *     limit: ITEMS_PER_PAGE,
 *     genres,
 *     yearMin,
 *     yearMax,
 *     sortBy,
 *     search,
 *   });
 *
 *   const hasActiveFilters = genres.length > 0 || yearMin || yearMax || sortBy !== "popularity.desc" || search;
 *
 *   return (
 *     <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *       {/* Page Header }
 *       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
 *         <div>
 *           <h1 className="text-3xl font-bold text-white tracking-tight">
 *             {search ? `Search: "${search}"` : "Explore Movies"}
 *           </h1>
 *           <p className="text-neutral-400 text-sm mt-1">
 *             Found {totalCount.toLocaleString()} results
 *           </p>
 *         </div>
 *       </div>
 *
 *       {/* Mobile Filters }
 *       <Suspense fallback={null}>
 *         <MobileFilters genres={allGenres} yearRange={yearRange} />
 *       </Suspense>
 *
 *       {/* Main Content Grid }
 *       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 *         {/* Desktop Sidebar }
 *         <Suspense
 *           fallback={
 *             <aside className="hidden lg:block space-y-6">
 *               <Skeleton className="h-8 w-24" />
 *               <Skeleton className="h-10 w-full" />
 *               <Skeleton className="h-48 w-full" />
 *               <Skeleton className="h-24 w-full" />
 *             </aside>
 *           }
 *         >
 *           <MoviesFilterSidebar 
 *             genres={allGenres} 
 *             yearRange={yearRange} 
 *             className="hidden lg:block" 
 *             idPrefix="desktop"
 *           />
 *         </Suspense>
 *
 *         {/* Movies Grid }
 *         <div className="lg:col-span-3">
 *           {movies.length === 0 ? (
 *             <EmptyState
 *               className="py-12"
 *               type={hasActiveFilters ? "no-results" : "no-data"}
 *               title={
 *                 hasActiveFilters ? (
 *                   <h2 className="text-xl font-semibold text-white mb-2">No movies found</h2>
 *                 ) : (
 *                   <h2 className="text-xl font-semibold text-white mb-2">No movies yet</h2>
 *                 )
 *               }
 *               description={
 *                 hasActiveFilters
 *                   ? "Try adjusting your filters to find more movies."
 *                   : "Movies will appear here once they're added to the database."
 *               }
 *             />
 *           ) : (
 *             <>
 *               <MoviesGrid movies={movies} />
 *
 *               {/* Pagination }
 *               <div className="mt-16 flex justify-center">
 *                 <Suspense fallback={null}>
 *                   <MoviesPagination
 *                     totalCount={totalCount}
 *                     itemsPerPage={ITEMS_PER_PAGE}
 *                   />
 *                 </Suspense>
 *               </div>
 *             </>
 *           )}
 *         </div>
 *       </div>
 *     </main>
 *   );
 * }
 */
export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  
  const page = Number(params.page) || 1;
  const genres = params.genres?.split(",").map(Number).filter(Boolean) || [];
  const yearMin = params.yearMin ? Number(params.yearMin) : undefined;
  const yearMax = params.yearMax ? Number(params.yearMax) : undefined;
  const sortBy = params.sortBy || "popularity.desc";
  const search = params.q || undefined;

  const { movies, totalCount, genres: allGenres, yearRange } = await getMoviesPageData({
    page,
    limit: ITEMS_PER_PAGE,
    genres,
    yearMin,
    yearMax,
    sortBy,
    search,
  });

  const hasActiveFilters = genres.length > 0 || yearMin || yearMax || sortBy !== "popularity.desc" || search;

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {search ? `Search: "${search}"` : "Explore Movies"}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Found {totalCount.toLocaleString()} results
          </p>
        </div>
      </div>

      {/* Mobile Filters */}
      <Suspense fallback={null}>
        <MobileFilters genres={allGenres} yearRange={yearRange} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <Suspense
          fallback={
            <aside className="hidden lg:block space-y-6">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </aside>
          }
        >
          <MoviesFilterSidebar 
            genres={allGenres} 
            yearRange={yearRange} 
            className="hidden lg:block" 
            idPrefix="desktop"
          />
        </Suspense>

        {/* Movies Grid */}
        <div className="lg:col-span-3">
          {movies.length === 0 ? (
            <EmptyState
              className="py-12"
              type={hasActiveFilters ? "no-results" : "no-data"}
              title={
                hasActiveFilters ? (
                  <h2 className="text-xl font-semibold text-white mb-2">No movies found</h2>
                ) : (
                  <h2 className="text-xl font-semibold text-white mb-2">No movies yet</h2>
                )
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your filters to find more movies."
                  : "Movies will appear here once they're added to the database."
              }
            />
          ) : (
            <>
              <MoviesGrid movies={movies} />

              {/* Pagination */}
              <div className="mt-16 flex justify-center">
                <Suspense fallback={null}>
                  <MoviesPagination
                    totalCount={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

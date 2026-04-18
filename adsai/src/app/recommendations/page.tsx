import { MovieCard } from "@/components/ui/movie-card";
import { UnauthenticatedState } from "./_components/unauthenticated-state";
import {
  getUserRecommendations,
  getCurrentUser,
  getUserRatingCount,
} from "./_lib/queries";

export const metadata = {
  title: "Recommended for You | CineLog",
  description: "Personalized movie recommendations based on your preferences",
};

/**
 * * RecommendationsPage component.
 *  *
 *  * @param {Object} currentUser - The current user object.
 *  * @returns {JSX.Element} The JSX element representing the page.
 *  
 * export default async function RecommendationsPage() {
 *   const currentUser = await getCurrentUser();
 *
 *   // Redirect to login if not authenticated
 *   if (!currentUser) {
 *     return (
 *       <main className="pt-24 pb-20">
 *         <UnauthenticatedState />
 *       </main>
 *     );
 *   }
 *
 *   // Get user's rating count
 *   const ratingCount = await getUserRatingCount(currentUser.id);
 *
 *   // Minimum ratings threshold for personalized recommendations
 *   const MIN_RATINGS_FOR_PERSONALIZATION = 3;
 *
 *   let movies;
 *   // Determine whether we consider the recommendations as "personalized" for UI copy
 *   const isPersonalized = ratingCount >= MIN_RATINGS_FOR_PERSONALIZATION;
 *
 *   // Always request recommendations from the recommendation algorithm.
 *   // Even users with few ratings will receive algorithm output.
 *   movies = await getUserRecommendations(currentUser.id, 20);
 *
 *   return (
 *     <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *       {/* Header }
 *       <header className="mb-8 pb-6 border-b border-neutral-800">
 *         <h1 className="text-3xl font-bold text-white tracking-tight">
 *           Recommended for You
 *         </h1>
 *         <p className="text-neutral-400 mt-1">
 *           {isPersonalized
 *             ? "Based on your preferences"
 *             : "Showing popular movies for now. Rate a few movies to get more personalized recommendations!"}
 *         </p>
 *       </header>
 *
 *       {/* Movies Grid - Fixed responsive grid with proper gaps }
 *       {movies.length > 0 ? (
 *         <>
 *           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
 *             {movies.map((movie) => {
 *               const year = movie.release_date
 *                 ? new Date(movie.release_date).getFullYear()
 *                 : "N/A";
 *
 *               return (
 *                 <MovieCard
 *                   key={movie.id}
 *                   title={movie.title}
 *                   posterUrl={movie.poster_url || "/placeholder-poster.png"}
 *                   year={year}
 *                   rating={movie.average_rating ?? undefined}
 *                   matchPercentage={isPersonalized ? movie.match_percentage : undefined}
 *                   showRatingBadge={false}
 *                   variant="compact"
 *                   href={`/movies/${movie.slug}`}
 *                 />
 *               );
 *             })}
 *           </div>
 *
 *           {/* End message }
 *           <div className="mt-12 text-center">
 *             <p className="text-neutral-500 text-sm mb-4">
 *               Reached the end of your suggestions.
 *             </p>
 *           </div>
 *         </>
 *       ) : (
 *         <div className="text-center py-20">
 *           <p className="text-neutral-400">No recommendations available at the moment.</p>
 *         </div>
 *       )}
 *     </main>
 *   );
 * }
 */
export default async function RecommendationsPage() {
  const currentUser = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!currentUser) {
    // Show a message prompting sign-in rather than the generic "unlock" state
    return (
      <main className="pt-24 pb-20">
        <UnauthenticatedState />
      </main>
    );
  }

  // Get user's rating count
  const ratingCount = await getUserRatingCount(currentUser.id);

  // Minimum ratings threshold for personalized recommendations
  const MIN_RATINGS_FOR_PERSONALIZATION = 3;

  // Determine whether we consider the recommendations as "personalized" for UI copy
  const isPersonalized = ratingCount >= MIN_RATINGS_FOR_PERSONALIZATION;

  // Always request recommendations from the recommendation algorithm.
  // Even users with few ratings will receive algorithm output.
  const movies = await getUserRecommendations(currentUser.id, 20);

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-neutral-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Recommended for You
        </h1>
        <p className="text-neutral-400 mt-1">
          {isPersonalized
            ? "Based on your preferences"
            : "Showing popular movies for now. Rate a few movies to get more personalized recommendations!"}
        </p>
      </header>

      {/* Movies Grid - Fixed responsive grid with proper gaps */}
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
            {movies.map((movie) => {
              const year = movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : "N/A";

              return (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_url || "/placeholder-poster.png"}
                  year={year}
                  rating={movie.average_rating ?? undefined}
                  matchPercentage={isPersonalized ? movie.match_percentage : undefined}
                  showRatingBadge={false}
                  variant="compact"
                  href={`/movies/${movie.slug}`}
                />
              );
            })}
          </div>

          {/* End message */}
          <div className="mt-12 text-center">
            <p className="text-neutral-500 text-sm mb-4">
              Reached the end of your suggestions.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-neutral-400">No recommendations available at the moment.</p>
        </div>
      )}
    </main>
  );
}

import { notFound } from "next/navigation";
import {
  getMovieById,
  getMovieCast,
  getMovieRatingStats,
  getMovieReviews,
  getMovieReviewCount,
  getCurrentUser,
  getUserMovieState,
} from "./_lib/queries";
import { getFollowingIds } from "@/app/users/[username]/_lib/queries";
import {
  MovieHero,
  MovieSidebar,
  MovieOverview,
  MovieCast,
  MovieReviews,
} from "./_components";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * * @param {MoviePageProps} props - Props for the MoviePage component.
 *  * @returns {JSX.Element} The JSX element representing the movie page.
 *  
 *
 * export default async function MoviePage({ params }: MoviePageProps) {
 *   const { id } = await params;
 *
 *   // Fetch movie data and current user in parallel
 *   // Reject requests that supply a UUID — this page must be accessed via slug only.
 *   const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 *   if (uuidV4.test(id)) {
 *     notFound();
 *   }
 *   const [movie, currentUser] = await Promise.all([
 *     getMovieById(id),
 *     getCurrentUser(),
 *   ]);
 *
 *   if (!movie) {
 *     notFound();
 *   }
 *
 *   // Fetch remaining data in parallel (including user-specific state if logged in)
 *   const [cast, ratingStats, reviews, reviewCount, userMovieState, followedUserIds] = await Promise.all([
 *     getMovieCast(movie.id, 10),
 *     getMovieRatingStats(movie.id),
 *     getMovieReviews(movie.id, 50, "recent", currentUser?.id), // Fetch more reviews for client-side sorting/filtering
 *     getMovieReviewCount(movie.id),
 *     currentUser ? getUserMovieState(currentUser.id, movie.id) : Promise.resolve(null),
 *     currentUser ? getFollowingIds(currentUser.id) : Promise.resolve([]),
 *   ]);
 *
 *   const releaseYear = movie.release_date
 *     ? new Date(movie.release_date).getFullYear()
 *     : null;
 *
 *   return (
 *     <>
 *       {/* Backdrop Hero }
 *       <MovieHero backdropUrl={movie.backdrop_url} />
 *
 *       {/* Main Content }
 *       <main className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
 *           {/* LEFT COLUMN - Desktop only }
 *           <aside className="hidden md:block md:col-span-4 lg:col-span-3">
 *             <MovieSidebar
 *               movie={movie}
 *               ratingStats={ratingStats}
 *               currentUser={currentUser}
 *               userMovieState={userMovieState}
 *             />
 *           </aside>
 *
 *           {/* MAIN COLUMN }
 *           <div className="md:col-span-8 lg:col-span-9 space-y-10">
 *             {/* 1. Title & Year }
 *             <div className="space-y-4 pt-4 md:pt-12">
 *               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
 *                 {movie.title}
 *                 {releaseYear && (
 *                   <span className="text-2xl md:text-3xl font-normal text-neutral-400 ml-2">
 *                     {releaseYear}
 *                   </span>
 *                 )}
 *               </h1>
 *
 *               {/* Director (both desktop and mobile) }
 *               {movie.director && (
 *                 <div className="text-sm text-neutral-300">
 *                   Directed by{" "}
 *                   <a
 *                     href={`/movies?q=${encodeURIComponent(movie.director.name)}`}
 *                     className="font-bold text-white hover:text-brand-400 underline decoration-neutral-700 hover:decoration-brand-400 underline-offset-4"
 *                   >
 *                     {movie.director.name}
 *                   </a>
 *                 </div>
 *               )}
 *
 *               {/* Genres (both desktop and mobile) }
 *               {movie.genres.length > 0 && (
 *                 <div className="flex flex-wrap gap-2">
 *                   {movie.genres.map((genre) => (
 *                     <a
 *                       key={genre.id}
 *                       href={`/movies?genres=${genre.id}`}
 *                       className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-xs text-neutral-300 transition-colors"
 *                     >
 *                       {genre.name}
 *                     </a>
 *                   ))}
 *                 </div>
 *               )}
 *             </div>
 *
 *             {/* 2. Overview/Plot }
 *             {movie.overview && <MovieOverview overview={movie.overview} />}
 *
 *             {/* 3. MOBILE METADATA BLOCK - Rating/Actions (between Overview and Cast) }
 *             <div className="block md:hidden">
 *               <MovieSidebar
 *                 movie={movie}
 *                 ratingStats={ratingStats}
 *                 currentUser={currentUser}
 *                 userMovieState={userMovieState}
 *               />
 *             </div>
 *
 *             {/* 4. Cast Section }
 *             {cast.length > 0 && <MovieCast cast={cast} movieId={movie.id} movieSlug={movie.slug} />}
 *
 *             {/* Divider }
 *             <hr className="border-neutral-800" />
 *
 *             {/* Reviews Section }
 *             <MovieReviews
 *               movieId={movie.id}
 *               movieSlug={movie.slug}
 *               movieTitle={movie.title}
 *               reviews={reviews}
 *               totalReviews={reviewCount}
 *               currentUser={currentUser}
 *               followedUserIds={followedUserIds}
 *             />
 *           </div>
 *         </div>
 *       </main>
 *     </>
 *   );
 * }
 */
export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  // Fetch movie data and current user in parallel
  // Reject requests that supply a UUID — this page must be accessed via slug only.
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidV4.test(id)) {
    notFound();
  }
  const [movie, currentUser] = await Promise.all([
    getMovieById(id),
    getCurrentUser(),
  ]);

  if (!movie) {
    notFound();
  }

  // Fetch remaining data in parallel (including user-specific state if logged in)
  const [cast, ratingStats, reviews, reviewCount, userMovieState, followedUserIds] = await Promise.all([
    getMovieCast(movie.id, 10),
    getMovieRatingStats(movie.id),
    getMovieReviews(movie.id, 50, "recent", currentUser?.id), // Fetch more reviews for client-side sorting/filtering
    getMovieReviewCount(movie.id),
    currentUser ? getUserMovieState(currentUser.id, movie.id) : Promise.resolve(null),
    currentUser ? getFollowingIds(currentUser.id) : Promise.resolve([]),
  ]);

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <>
      {/* Backdrop Hero */}
      <MovieHero backdropUrl={movie.backdrop_url} />

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN - Desktop only */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3">
            <MovieSidebar
              movie={movie}
              ratingStats={ratingStats}
              currentUser={currentUser}
              userMovieState={userMovieState}
            />
          </aside>

          {/* MAIN COLUMN */}
          <div className="md:col-span-8 lg:col-span-9 space-y-10">
            {/* 1. Title & Year */}
            <div className="space-y-4 pt-4 md:pt-12">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                {movie.title}
                {releaseYear && (
                  <span className="text-2xl md:text-3xl font-normal text-neutral-400 ml-2">
                    {releaseYear}
                  </span>
                )}
              </h1>

              {/* Director (both desktop and mobile) */}
              {movie.director && (
                <div className="text-sm text-neutral-300">
                  Directed by{" "}
                  <a
                    href={`/movies?q=${encodeURIComponent(movie.director.name)}`}
                    className="font-bold text-white hover:text-brand-400 underline decoration-neutral-700 hover:decoration-brand-400 underline-offset-4"
                  >
                    {movie.director.name}
                  </a>
                </div>
              )}

              {/* Genres (both desktop and mobile) */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <a
                      key={genre.id}
                      href={`/movies?genres=${genre.id}`}
                      className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-xs text-neutral-300 transition-colors"
                    >
                      {genre.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Overview/Plot */}
            {movie.overview && <MovieOverview overview={movie.overview} />}

            {/* 3. MOBILE METADATA BLOCK - Rating/Actions (between Overview and Cast) */}
            <div className="block md:hidden">
              <MovieSidebar
                movie={movie}
                ratingStats={ratingStats}
                currentUser={currentUser}
                userMovieState={userMovieState}
              />
            </div>

            {/* 4. Cast Section */}
            {cast.length > 0 && <MovieCast cast={cast} movieId={movie.id} movieSlug={movie.slug} />}

            {/* Divider */}
            <hr className="border-neutral-800" />

            {/* Reviews Section */}
            <MovieReviews
              movieId={movie.id}
              movieSlug={movie.slug}
              movieTitle={movie.title}
              reviews={reviews}
              totalReviews={reviewCount}
              currentUser={currentUser}
              followedUserIds={followedUserIds}
            />
          </div>
        </div>
      </main>
    </>
  );
}

/**
 * * Generates metadata for a movie page.
 *  *
 *  * @param {MoviePageProps} params - The parameters required to generate the metadata.
 *  * @returns {{ title: string, description: string }} - An object containing the generated metadata.
 */
export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;

  try {
    const movie = await getMovieById(id);
    const releaseYear = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : null;

    return {
      title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ""} | CineLog`,
      description: movie.overview || `Details for ${movie.title}`,
    };
  } catch {
    return {
      title: "Movie Not Found | CineLog",
      description: "The requested movie could not be found.",
    };
  }
}

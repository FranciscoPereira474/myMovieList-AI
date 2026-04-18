import {
  HeroSection,
  RecommendedSection,
  ReviewsSection,
  ListsSection,
  TopRatedSection,
} from "./(home)/_components";
import {
  getTrendingMovies,
  getPopularReviews,
  getPopularLists,
  getTopRatedMovies,
  getCurrentUser,
  getPersonalizedRecommendations,
} from "./(home)/_lib/queries";

/**
 * * Home component that displays trending, recommended, popular reviews, and top rated movies.
 *  *
 *  * @param {object} currentUser - The current user object
 *  * @returns {JSX.Element} The JSX element representing the home page
 */
export default async function Home() {
  // Get current user first (needed for reviews voting state)
  const currentUser = await getCurrentUser();

  // Fetch all data in parallel for better performance
  const [trendingMovies, recommendedMovies, popularReviews, popularLists, topRatedMovies] =
    await Promise.all([
      getTrendingMovies(10),
      getPersonalizedRecommendations(20, currentUser?.id), // Using recommendation algorithm (pass user id)
      getPopularReviews(6, currentUser?.id),
      getPopularLists(6),
      getTopRatedMovies(20),
    ]);

  return (
    <main className="relative pt-16">
      <div className="flex flex-col min-h-screen min-w-0">
        {/* Hero Section */}
        {trendingMovies.length > 0 && <HeroSection movies={trendingMovies} />}

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 -mt-10 relative z-20 w-full min-w-0">
          {/* Recommended Movies Carousel */}
          <RecommendedSection movies={recommendedMovies} />

          {/* Popular Reviews Carousel */}
          <ReviewsSection reviews={popularReviews} isLoggedIn={!!currentUser} />

          {/* Popular Lists Carousel */}
          <ListsSection lists={popularLists} />

          {/* Top Rated Movies Grid */}
          <TopRatedSection movies={topRatedMovies} />
        </div>
      </div>
    </main>
  );
}

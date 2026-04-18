import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { List } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import {
  getUserProfile,
  getUserStats,
  getUserRecentMovies,
  getUserReviews,
  getUserLists,
  getCurrentUser,
  getIsFollowing,
  getUserRatingsPaginated,
  getUserWatchlistPaginated,
} from "./_lib/queries";
import type { LoggedMovie, UserList } from "./_lib/queries";
import {
  ProfileHeader,
  RecentActivity,
  UserReviews,
  UserLists,
  ProfileTabs,
} from "./_components";

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

/**
 * * @param {UserPageProps} props - The component's props.
 *  * @returns {JSX.Element} The rendered UserPage component.
 *  
 * export default async function UserPage({ params, searchParams }: UserPageProps) {
 *   const { username } = await params;
 *   const { tab = "activity", page: pageParam = "1" } = await searchParams;
 *   const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
 *
 *   // Resolve profile by username (getUserProfile supports username or UUID)
 *   const profile = await getUserProfile(username);
 *
 *   if (!profile) {
 *     return notFound();
 *   }
 *
 *   const currentUser = await getCurrentUser();
 *
 *   const [stats, isFollowing] = await Promise.all([
 *     getUserStats(profile.id),
 *     currentUser && currentUser.id !== profile.id
 *       ? getIsFollowing(currentUser.id, profile.id)
 *       : Promise.resolve(false),
 *   ]);
 *
 *   const ITEMS_PER_PAGE = 24;
 *
 *   // Fetch tab-specific data
 *   let recentMovies, reviews, lists, ratings, watchlist, ratingsCount, watchlistCount;
 *   
 *   if (tab === "activity" || !tab) {
 *     [recentMovies, reviews, lists] = await Promise.all([
 *       getUserRecentMovies(profile.id, 10),
 *       getUserReviews(profile.id, 3),
 *       getUserLists(profile.id, 3, "created_at", currentUser?.id),
 *     ]);
 *   } else if (tab === "ratings") {
 *     const from = (currentPage - 1) * ITEMS_PER_PAGE;
 *     const result = await getUserRatingsPaginated(profile.id, from, ITEMS_PER_PAGE);
 *     ratings = result.ratings;
 *     ratingsCount = result.count;
 *   } else if (tab === "watchlist") {
 *     const from = (currentPage - 1) * ITEMS_PER_PAGE;
 *     const result = await getUserWatchlistPaginated(profile.id, from, ITEMS_PER_PAGE);
 *     watchlist = result.watchlist;
 *     watchlistCount = result.count;
 *   } else if (tab === "lists") {
 *     lists = await getUserLists(profile.id, 3, "saves", currentUser?.id);
 *   }
 *
 *   return (
 *     <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *       <ProfileHeader
 *         profile={profile}
 *         stats={stats}
 *         currentUserId={currentUser?.id ?? null}
 *         isFollowing={isFollowing}
 *       />
 *
 *       {/* Navigation tabs }
 *       <ProfileTabs 
 *         activeTab={tab as "ratings" | "activity" | "watchlist" | "lists"} 
 *         userId={profile.id}
 *       />
 *
 *       {(tab === "activity" || !tab) && recentMovies && reviews && lists && (
 *         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 *           <div className="lg:col-span-8">
 *             <RecentActivity movies={recentMovies} username={profile.username} />
 *           </div>
 *           <aside className="lg:col-span-4 space-y-6">
 *             <UserReviews reviews={reviews} username={profile.username} />
 *             <UserLists lists={lists} username={profile.username} userId={profile.id} />
 *           </aside>
 *         </div>
 *       )}
 *
 *       {tab === "ratings" && ratings && (
 *         <div>
 *           <h2 className="text-2xl font-bold mb-6">All Ratings</h2>
 *           {ratings.length === 0 ? (
 *             <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
 *               <p className="text-neutral-400">@{profile.username} hasn&apos;t rated any movies yet</p>
 *             </div>
 *           ) : (
 *             <>
 *               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
 *                 {ratings.map((movie) => (
 *                   <MovieCard key={movie.id} movie={movie} />
 *                 ))}
 *               </div>
 *               {ratingsCount && ratingsCount > ITEMS_PER_PAGE && (
 *                 <div className="mt-8">
 *                   <TabPagination
 *                     currentPage={currentPage}
 *                     totalPages={Math.ceil(ratingsCount / ITEMS_PER_PAGE)}
 *                     username={profile.username}
 *                     tab="ratings"
 *                   />
 *                 </div>
 *               )}
 *             </>
 *           )}
 *         </div>
 *       )}
 *
 *       {tab === "watchlist" && watchlist && (
 *         <div>
 *           <h2 className="text-2xl font-bold mb-6">Watchlist</h2>
 *           {watchlist.length === 0 ? (
 *             <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
 *               <p className="text-neutral-400">@{profile.username} doesn&apos;t have any movies in their watchlist yet</p>
 *             </div>
 *           ) : (
 *             <>
 *               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
 *                 {watchlist.map((movie) => (
 *                   <MovieCard key={movie.id} movie={movie} />
 *                 ))}
 *               </div>
 *               {watchlistCount && watchlistCount > ITEMS_PER_PAGE && (
 *                 <div className="mt-8">
 *                   <TabPagination
 *                     currentPage={currentPage}
 *                     totalPages={Math.ceil(watchlistCount / ITEMS_PER_PAGE)}
 *                     username={profile.username}
 *                     tab="watchlist"
 *                   />
 *                 </div>
 *               )}
 *             </>
 *           )}
 *         </div>
 *       )}
 *
 *       {tab === "lists" && lists && (
 *         <div>
 *           <div className="flex items-center justify-between mb-6">
 *             <h2 className="text-2xl font-bold">Top Lists</h2>
 *             <Link
 *               href={`/lists/${profile.username}`}
 *               className="px-4 py-2 text-sm font-medium text-brand-400 hover:text-brand-300 hover:bg-brand-900/20 rounded-lg transition-colors"
 *             >
 *               More
 *             </Link>
 *           </div>
 *           {lists.length === 0 ? (
 *             <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
 *               <p className="text-neutral-400">@{profile.username} hasn&apos;t created any public lists yet</p>
 *             </div>
 *           ) : (
 *             <div className="space-y-4">
 *               {lists.map((list) => (
 *                 <ListCard key={list.id} list={list} />
 *               ))}
 *             </div>
 *           )}
 *         </div>
 *       )}
 *
 *     </main>
 *   );
 * }
 */
export default async function UserPage({ params, searchParams }: UserPageProps) {
  const { username } = await params;
  const { tab = "activity", page: pageParam = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);

  // Resolve profile by username (getUserProfile supports username or UUID)
  const profile = await getUserProfile(username);

  if (!profile) {
    return notFound();
  }

  const currentUser = await getCurrentUser();

  const [stats, isFollowing] = await Promise.all([
    getUserStats(profile.id),
    currentUser && currentUser.id !== profile.id
      ? getIsFollowing(currentUser.id, profile.id)
      : Promise.resolve(false),
  ]);

  const ITEMS_PER_PAGE = 24;

  // Fetch tab-specific data
  let recentMovies, reviews, lists, ratings, watchlist, ratingsCount, watchlistCount;
  
  if (tab === "activity" || !tab) {
    [recentMovies, reviews, lists] = await Promise.all([
      getUserRecentMovies(profile.id, 10),
      getUserReviews(profile.id, 3),
      getUserLists(profile.id, 3, "created_at", currentUser?.id),
    ]);
  } else if (tab === "ratings") {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const result = await getUserRatingsPaginated(profile.id, from, ITEMS_PER_PAGE);
    ratings = result.ratings;
    ratingsCount = result.count;
  } else if (tab === "watchlist") {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const result = await getUserWatchlistPaginated(profile.id, from, ITEMS_PER_PAGE);
    watchlist = result.watchlist;
    watchlistCount = result.count;
  } else if (tab === "lists") {
    lists = await getUserLists(profile.id, 3, "saves", currentUser?.id);
  }

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProfileHeader
        profile={profile}
        stats={stats}
        currentUserId={currentUser?.id ?? null}
        isFollowing={isFollowing}
      />

      {/* Navigation tabs */}
      <ProfileTabs 
        activeTab={tab as "ratings" | "activity" | "watchlist" | "lists"} 
        userId={profile.id}
      />

      {(tab === "activity" || !tab) && recentMovies && reviews && lists && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <RecentActivity movies={recentMovies} username={profile.username} />
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <UserReviews reviews={reviews} username={profile.username} />
            <UserLists lists={lists} username={profile.username} />
          </aside>
        </div>
      )}

      {tab === "ratings" && ratings && (
        <div>
          <h2 className="text-2xl font-bold mb-6">All Ratings</h2>
          {ratings.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <p className="text-neutral-400">@{profile.username} hasn&apos;t rated any movies yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {ratings.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {ratingsCount && ratingsCount > ITEMS_PER_PAGE && (
                <div className="mt-8">
                  <TabPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(ratingsCount / ITEMS_PER_PAGE)}
                    username={profile.username}
                    tab="ratings"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "watchlist" && watchlist && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Watchlist</h2>
          {watchlist.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <p className="text-neutral-400">@{profile.username} doesn&apos;t have any movies in their watchlist yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {watchlist.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {watchlistCount && watchlistCount > ITEMS_PER_PAGE && (
                <div className="mt-8">
                  <TabPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(watchlistCount / ITEMS_PER_PAGE)}
                    username={profile.username}
                    tab="watchlist"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "lists" && lists && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Lists</h2>
            <Link
              href={`/lists/${profile.username}`}
              className="px-4 py-2 text-sm font-medium text-brand-400 hover:text-brand-300 hover:bg-brand-900/20 rounded-lg transition-colors"
            >
              More
            </Link>
          </div>
          {lists.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <p className="text-neutral-400">@{profile.username} hasn&apos;t created any public lists yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}

// -----------------------------------------------------------------------------
// Subcomponents (MovieCard, ListCard, TabPagination, SavedListsSection)
// -----------------------------------------------------------------------------

interface MovieCardProps { movie: LoggedMovie }
function MovieCard({ movie }: MovieCardProps) {
  const isHighRating = movie.rating && movie.rating >= 8;

  const content = (
    <>
      <div className="aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 relative shadow-md">
        {movie.poster_url ? (
          <Image src={movie.poster_url} alt={movie.title} fill sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw" className="object-cover transition duration-300 group-hover:scale-105" />
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

function ListCard({ list }: { list: UserList }) {
  return (
    <Link href={`/list/${list.id}`} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded bg-brand-900/20 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0"><List className="w-5 h-5" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-neutral-200 group-hover:text-white transition-colors truncate">{list.name}</h3>
          {list.description && <p className="text-sm text-neutral-400 line-clamp-1">{list.description}</p>}
        </div>
      </div>
      <span className="text-sm text-neutral-500 shrink-0">{list.item_count} {list.item_count === 1 ? "film" : "films"}</span>
    </Link>
  );
}

function TabPagination({ currentPage, totalPages, username, tab }: { currentPage: number; totalPages: number; username: string; tab: string }) {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center gap-2">
      {currentPage > 1 && (
        <Link href={`/users/${username}?tab=${tab}&page=${currentPage - 1}`} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">Previous</Link>
      )}

      {startPage > 1 && (
        <>
          <Link href={`/users/${username}?tab=${tab}&page=1`} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">1</Link>
          {startPage > 2 && <span className="text-neutral-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link key={page} href={`/users/${username}?tab=${tab}&page=${page}`} className={`px-3 py-2 rounded-lg transition-colors ${page === currentPage ? "bg-brand-500 text-white font-bold" : "bg-neutral-800 hover:bg-neutral-700 text-white"}`}>{page}</Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-neutral-500">...</span>}
          <Link href={`/users/${username}?tab=${tab}&page=${totalPages}`} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={`/users/${username}?tab=${tab}&page=${currentPage + 1}`} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">Next</Link>
      )}
    </div>
  );
}


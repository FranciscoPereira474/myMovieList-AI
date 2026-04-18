import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getReviewById, getReviewComments, getCurrentUser, getUserTopRatedMovies, isMovieInWatchlist } from "./_lib/queries";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { CommentList } from "./_components/comment-list";
import { ReviewCommentForm } from "./_components/review-comment-form";
import { ReviewBody } from "./_components/review-body";
import { ReviewActions } from "./_components/review-actions";
import { ReviewSidebar } from "./_components/review-sidebar";
import { Eye, Star } from "lucide-react";
import { timeAgo } from "@/lib/time-utils";

interface ReviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * * ReviewPage component
 *  *
 *  * Displays a single review page with its details, comments, and related movies.
 *  *
 *  * @param {ReviewPageProps} props - Component props
 *  * @returns {JSX.Element} The rendered ReviewPage component
 *  
 * export default async function ReviewPage({ params }: ReviewPageProps) {
 *   const { id } = await params;
 *   const currentUser = await getCurrentUser();
 *   const review = await getReviewById(id, currentUser?.id);
 *
 *   if (!review) {
 *     // Instead of throwing a notFound error, render a friendly empty state
 *     return (
 *       <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         <EmptyState
 *           type="error"
 *           icon={(
 *             <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
 *               <path d="M280-80q-83 0-141.5-58.5T80-280q0-83 58.5-141.5T280-480q83 0 141.5 58.5T480-280q0 83-58.5 141.5T280-80Zm544-40L568-376q-12-13-25.5-26.5T516-428q38-24 61-64t23-88q0-75-52.5-127.5T420-760q-75 0-127.5 52.5T240-580q0 6 .5 11.5T242-557q-18 2-39.5 8T164-535q-2-11-3-22t-1-23q0-109 75.5-184.5T420-840q109 0 184.5 75.5T680-580q0 43-13.5 81.5T629-428l251 252-56 56Zm-615-61 71-71 70 71 29-28-71-71 71-71-28-28-71 71-71-71-28 28 71 71-71 71 28 28Z" />
 *             </svg>
 *           )}
 *           
 *           title="Review not found"
 *           description={"We couldn't find the review. It may have been removed or the link might be incorrect."}
 *           action={{ label: "Go home", href: "/" }}
 *           secondaryAction={{ label: "Browse reviews", href: "/reviews" }}
 *         />
 *       </main>
 *     );
 *   }
 *
 *   const comments = await getReviewComments(id, currentUser?.id);
 *   const topRatedMovies = await getUserTopRatedMovies(review.user.id, review.movie.id);
 *   
 *   // Safely check watchlist status
 *   let inWatchlist = false;
 *   try {
 *     inWatchlist = await isMovieInWatchlist(review.movie.id, currentUser?.id);
 *   } catch (error) {
 *     console.error("Failed to check watchlist status:", error);
 *   }
 *
 *   const relativeTime = timeAgo(review.created_at);
 *
 *   const watchedDate = review.watched_date
 *     ? new Intl.DateTimeFormat("en-US", {
 *         year: "numeric",
 *         month: "long",
 *         day: "numeric",
 *       }).format(new Date(review.watched_date))
 *     : null;
 *
 *   return (
 *     <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 *         <article className="lg:col-span-8">
 *           <header className="mb-8">
 *             <div className="flex items-start justify-between mb-6">
 *               <div className="flex items-center gap-4">
 *                 <Link href={`/users/${review.user.username}`}>
 *                   <UserAvatar
 *                     src={review.user.avatar_url || undefined}
 *                     alt={review.user.username}
 *                     size="lg"
 *                     className="h-12 w-12 border-2 border-neutral-800"
 *                   />
 *                 </Link>
 *                 <div>
 *                   <div className="flex items-center gap-2 text-sm">
 *                     <span className="text-neutral-400">Review by</span>
 *                     <Link
 *                       href={`/users/${review.user.username}`}
 *                       className="font-bold text-white hover:text-brand-500 transition-colors"
 *                     >
 *                       {review.user.username}
 *                     </Link>
 *                     <span className="text-neutral-600">•</span>
 *                     <span className="text-neutral-500">{relativeTime}</span>
 *                   </div>
 *                   {watchedDate && (
 *                     <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
 *                       <Eye className="w-3.5 h-3.5" />
 *                       <span>Watched {watchedDate}</span>
 *                     </div>
 *                   )}
 *                 </div>
 *               </div>
 *             </div>
 *
 *             <div className="mb-6">
 *               {review.user_rating !== null && (
 *                 <div className="flex items-center gap-3 mb-3">
 *                   <StarRating 
 *                     value={review.user_rating > 5 ? review.user_rating / 2 : review.user_rating} 
 *                     size="md" 
 *                     color="brand" 
 *                     showValue={true} 
 *                   />
 *                 </div>
 *               )}
 *
 *               {/* Review title and body }
 *               {review.title && (
 *                 <h2 className="text-2xl font-bold text-white mb-3 break-words hyphens-auto whitespace-normal">
 *                   {review.title}
 *                 </h2>
 *               )}
 *
 *               {review.body ? (
 *                 <div className="prose prose-invert max-w-none text-neutral-300 mb-4">
 *                   <ReviewBody content={review.body} hasSpoiler={!!review.contains_spoilers} />
 *                 </div>
 *               ) : (
 *                 <p className="text-neutral-500 text-sm mb-4">No review content.</p>
 *               )}
 *
 *               <ReviewActions
 *                 reviewId={review.id}
 *                 upvotes={review.upvotes_count ?? 0}
 *                 downvotes={review.downvotes_count ?? 0}
 *                 commentsCount={review.comments_count ?? 0}
 *                 currentUserVote={review.currentUserVote}
 *                 isLoggedIn={!!currentUser}
 *                 currentUserId={currentUser?.id}
 *                 reviewAuthorId={review.user.id}
 *                 movieId={review.movie.id}
 *               />
 *               </div>
 *               </header>
 *
 *               <div id="comments-section" className="mt-12 border-t border-neutral-800 pt-8 space-y-8">
 *             <h3 className="text-xl font-bold text-white mb-6">
 *               {review.comments_count === 1 ? "1 Comment" : `${review.comments_count} Comments`}
 *             </h3>
 *             
 *             {currentUser ? (
 *               <div className="mb-8">
 *                 <ReviewCommentForm
 *                   reviewId={review.id}
 *                   userAvatarUrl={currentUser.user_metadata?.avatar_url || undefined}
 *                   userName={currentUser.user_metadata?.username || "User"}
 *                 />
 *               </div>
 *             ) : (
 *               <div className="bg-neutral-900/50 rounded-lg p-6 text-center mb-8 border border-neutral-800">
 *                 <p className="text-neutral-400 mb-4">Log in to join the discussion</p>
 *                 <Button asChild variant="outline">
 *                   <Link href={`/login?redirect=${encodeURIComponent(`/reviews/${review.id}`)}`}>Sign In</Link>
 *                 </Button>
 *               </div>
 *             )}
 *
 *             <div className="space-y-6">
 *               <CommentList initialComments={comments} currentUserId={currentUser?.id} reviewId={review.id} />
 *             </div>
 *           </div>
 *         </article>
 *
 *         <aside className="lg:col-span-4 order-first lg:order-last">
 *           <div className="sticky top-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
 *             <ReviewSidebar 
 *               movie={review.movie} 
 *               currentUser={currentUser} 
 *               isInWatchlist={inWatchlist}
 *             />
 *
 *             <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-800 h-fit">
 *                 <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
 *                     More from {review.user.username}
 *                 </h4>
 *                 <div className="space-y-3">
 *                   {topRatedMovies.length === 0 ? (
 *                     <p className="text-neutral-500 text-sm">No other ratings yet.</p>
 *                   ) : (
 *                     topRatedMovies.map((item) => {
 *                       const content = (
 *                         <>
 *                           <span className="text-neutral-300 text-sm font-medium group-hover:text-brand-500 transition-colors truncate mr-2 flex-1">
 *                             {item.movie.slug ? (
 *                               <Link
 *                                 key={item.movie.id}
 *                                 href={`/movies/${item.movie.slug}`}
 *                                 className="flex items-center justify-between group cursor-pointer"
 *                               >
 *                                 {item.movie.title}
 *                               </Link>
 *                             ) : (
 *                               item.movie.title
 *                             )}
 *                           </span>
 *                           <div className="flex items-center gap-2">
 *                             <StarRating 
 *                               value={item.rating} 
 *                               size="md" 
 *                               color="brand" 
 *                               showValue={true} 
 *                             />
 *                             <span>{item.ratingCount} ratings</span>
 *                           </div>
 *                         </>
 *                       );
 *
 *                       if (item.movie.slug) {
 *                         return (
 *                           <Link
 *                             key={item.movie.id}
 *                             href={`/movies/${item.movie.slug}`}
 *                             className="flex items-center justify-between group cursor-pointer"
 *                           >
 *                             {content}
 *                           </Link>
 *                         );
 *                       }
 *
 *                       return (
 *                         <div key={item.movie.id} className="flex items-center justify-between group cursor-pointer">
 *                           {content}
 *                         </div>
 *                       );
 *                     })
 *                   )}
 *                 </div>
 *             </div>
 *           </div>
 *         </aside>
 *       </div>
 *     </main>
 *   );
 * }
 */
export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const review = await getReviewById(id, currentUser?.id);

  if (!review) {
    // Instead of throwing a notFound error, render a friendly empty state
    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmptyState
          type="error"
          icon={(
            <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
              <path d="M280-80q-83 0-141.5-58.5T80-280q0-83 58.5-141.5T280-480q83 0 141.5 58.5T480-280q0 83-58.5 141.5T280-80Zm544-40L568-376q-12-13-25.5-26.5T516-428q38-24 61-64t23-88q0-75-52.5-127.5T420-760q-75 0-127.5 52.5T240-580q0 6 .5 11.5T242-557q-18 2-39.5 8T164-535q-2-11-3-22t-1-23q0-109 75.5-184.5T420-840q109 0 184.5 75.5T680-580q0 43-13.5 81.5T629-428l251 252-56 56Zm-615-61 71-71 70 71 29-28-71-71 71-71-28-28-71 71-71-71-28 28 71 71-71 71 28 28Z" />
            </svg>
          )}
          
          title="Review not found"
          description={"We couldn't find the review. It may have been removed or the link might be incorrect."}
          action={{ label: "Go home", href: "/" }}
          secondaryAction={{ label: "Browse reviews", href: "/reviews" }}
        />
      </main>
    );
  }

  const comments = await getReviewComments(id, currentUser?.id);
  const topRatedMovies = await getUserTopRatedMovies(review.user.id, review.movie.id);
  
  // Safely check watchlist status
  let inWatchlist = false;
  try {
    inWatchlist = await isMovieInWatchlist(review.movie.id, currentUser?.id);
  } catch (error) {
    console.error("Failed to check watchlist status:", error);
  }

  const relativeTime = timeAgo(review.created_at);

  const watchedDate = review.watched_date
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(review.watched_date))
    : null;

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <article className="lg:col-span-8">
          <header className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href={`/users/${review.user.username}`}>
                  <UserAvatar
                    src={review.user.avatar_url || undefined}
                    alt={review.user.username}
                    size="lg"
                    className="h-12 w-12 border-2 border-neutral-800"
                  />
                </Link>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400">Review by</span>
                    <Link
                      href={`/users/${review.user.username}`}
                      className="font-bold text-white hover:text-brand-500 transition-colors"
                    >
                      {review.user.username}
                    </Link>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-500">{relativeTime}</span>
                  </div>
                  {watchedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Watched {watchedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              {review.user_rating !== null && (
                <div className="flex items-center gap-3 mb-3">
                  <StarRating 
                    value={review.user_rating > 5 ? review.user_rating / 2 : review.user_rating} 
                    size="md" 
                    color="brand" 
                    showValue={true} 
                  />
                </div>
              )}

              {/* Review title and body */}
              {review.title && (
                <h2 className="text-2xl font-bold text-white mb-3 break-words hyphens-auto whitespace-normal">
                  {review.title}
                </h2>
              )}

              {review.body ? (
                <div className="prose prose-invert max-w-none text-neutral-300 mb-4">
                  <ReviewBody content={review.body} hasSpoiler={!!review.contains_spoilers} />
                </div>
              ) : (
                <p className="text-neutral-500 text-sm mb-4">No review content.</p>
              )}

              <ReviewActions
                reviewId={review.id}
                upvotes={review.upvotes_count ?? 0}
                downvotes={review.downvotes_count ?? 0}
                commentsCount={review.comments_count ?? 0}
                currentUserVote={review.currentUserVote}
                isLoggedIn={!!currentUser}
                currentUserId={currentUser?.id}
                reviewAuthorId={review.user.id}
                movieId={review.movie.id}
              />
              </div>
              </header>

              <div id="comments-section" className="mt-12 border-t border-neutral-800 pt-8 space-y-8">
            <h3 className="text-xl font-bold text-white mb-6">
              {review.comments_count === 1 ? "1 Comment" : `${review.comments_count} Comments`}
            </h3>
            
            {currentUser ? (
              <div className="mb-8">
                <ReviewCommentForm
                  reviewId={review.id}
                  userAvatarUrl={currentUser.user_metadata?.avatar_url || undefined}
                  userName={currentUser.user_metadata?.username || "User"}
                />
              </div>
            ) : (
              <div className="bg-neutral-900/50 rounded-lg p-6 text-center mb-8 border border-neutral-800">
                <p className="text-neutral-400 mb-4">Log in to join the discussion</p>
                <Button asChild variant="outline">
                  <Link href={`/login?redirect=${encodeURIComponent(`/reviews/${review.id}`)}`}>Sign In</Link>
                </Button>
              </div>
            )}

            <div className="space-y-6">
              <CommentList initialComments={comments} currentUserId={currentUser?.id} reviewId={review.id} />
            </div>
          </div>
        </article>

        <aside className="lg:col-span-4 order-first lg:order-last">
          <div className="sticky top-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <ReviewSidebar 
              movie={review.movie} 
              currentUser={currentUser} 
              isInWatchlist={inWatchlist}
            />

            <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-800 h-fit">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                    More from {review.user.username}
                </h4>
                <div className="space-y-3">
                  {topRatedMovies.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No other ratings yet.</p>
                  ) : (
                    topRatedMovies.map((item) => {
                      const content = (
                        <>
                          <span className="text-neutral-300 text-sm font-medium group-hover:text-brand-500 transition-colors truncate mr-2 flex-1 text-left">
                            {item.movie.title}
                          </span>
                          <div className="flex gap-0.5 shrink-0 w-[68px] justify-start">
                            {Array.from({ length: Math.round(item.rating / 2) }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-brand-500 fill-brand-500" />
                            ))}
                          </div>
                        </>
                      );

                      if (item.movie.slug) {
                        return (
                          <Link
                            key={item.movie.id}
                            href={`/movies/${item.movie.slug}`}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <div key={item.movie.id} className="flex items-center justify-between group cursor-pointer">
                          {content}
                        </div>
                      );
                    })
                  )}
                </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
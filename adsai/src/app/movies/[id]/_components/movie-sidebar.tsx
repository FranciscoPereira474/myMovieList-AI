"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Star, Plus, List, Share2, Check, Loader2, ChevronDown, Minus } from "lucide-react";
import { RatingDistribution } from "@/components/ui/rating-distribution";
import { MovieRating } from "@/components/ui/movie-rating";
import { WatchTrailerButton } from "@/components/ui";
import { rateMovie, removeRating, addToWatchlist, removeFromWatchlist } from "../_lib/actions";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import type { MovieDetails, MovieRatingStats, CurrentUser, UserMovieState } from "../_lib/queries";

interface MovieSidebarProps {
  movie: MovieDetails;
  ratingStats: MovieRatingStats;
  currentUser: CurrentUser | null;
  userMovieState: UserMovieState | null;
}

/**
 * This is a React component that renders a sidebar for a movie. It includes various features such as:
 *
 * 1. Poster: Displays the poster of the movie.
 * 2. Watch Trailer Button: Allows users to watch the trailer of the movie.
 * 3. Rating Card: Displays the average rating and distribution of ratings for the movie.
 * 4. Action Buttons:
 * 	* Rate This Movie: Allows users to rate the movie.
 * 	* Watchlist Button: Allows users to add or remove the movie from their watchlist.
 * 	* Add to List Button: Allows users to add the movie to one of their lists.
 * 	* Share Button: Allows users to share the movie on social media.
 *
 * The component also includes various UI elements such as buttons, links, and icons. It uses React hooks and state management to handle user interactions and update the component's state accordingly.
 *
 * Here are some suggestions for improvement:
 *
 * 1. Use a more consistent naming convention throughout the codebase.
 * 2. Consider using a CSS-in-JS solution like styled-components or emotion to manage styles.
 * 3. Use React Hooks to manage state and side effects instead of class components.
 * 4. Consider using a library like react-router-dom to handle routing.
 * 5. Add accessibility features such as ARIA attributes and screen reader support.
 * 6. Use a linter and code formatter to maintain consistent coding standards.
 * 7. Consider adding unit tests and integration tests to ensure the component works correctly.
 *
 * Here is an example of how you could refactor the component using React Hooks:
 *
 * jsx
 * import React, { useState } from 'react';
 * import { useNavigate } from 'react-router-dom';
 *
 * const MovieSidebar = () => {
 *   const [showCopiedToast, setShowCopiedToast] = useState(false);
 *   const navigate = useNavigate();
 *
 *   const handleShare = async () => {
 *     // Share the movie on social media
 *     console.log('Sharing movie...');
 *     setShowCopiedToast(true);
 *     setTimeout(() => {
 *       setShowCopiedToast(false);
 *     }, 2000);
 *   };
 *
 *   return (
 *     <div>
 *       {/* Poster }
 *       <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" />
 *
 *       {/* Watch Trailer Button }
 *       <WatchTrailerButton trailerUrl={movie.trailer_url} movieTitle={movie.title} variant="primary" fullWidth hideWhenUnavailable />
 *
 *       {/* Rating Card }
 *       <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4">
 *         {ratingStats.total_ratings > 0 ? (
 *           <>
 *             <div className="flex items-end justify-center gap-2 mb-2">
 *               <Star className="h-6 w-6 text-[#F5C518] mb-1" fill="currentColor" />
 *               <span className="text-4xl font-bold text-white">{ratingStats.average_rating.toFixed(1)}</span>
 *               <span className="text-sm text-neutral-400 mb-1">/ 5</span>
 *             </div>
 *             <p className="text-center text-xs text-neutral-500 mb-4">
 *               Based on {ratingStats.total_ratings.toLocaleString()} ratings
 *             </p>
 *
 *             {/* Rating Distribution }
 *             <RatingDistribution distribution={ratingStats.distribution} totalRatings={ratingStats.total_ratings} showLabels size="sm" />
 *           </>
 *         ) : (
 *           <div className="text-center py-4">
 *             <Star className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
 *             <p className="text-sm text-neutral-500">No ratings yet</p>
 *             <p className="text-xs text-neutral-600 mt-1">Be the first to rate!</p>
 *           </div>
 *         )}
 *       </div>
 *
 *       {/* Action Buttons }
 *       <div className="grid grid-cols-2 gap-3">
 *         {/* Rate This Movie }
 *         <div className="col-span-2 flex flex-col items-center justify-center bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-lg py-4 transition-colors group">
 *           <span className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider group-hover:text-[#F5C518]">
 *             {userRating ? 'Your rating' : 'Rate this movie'}
 *           </span>
 *           <MovieRating
 *             interactive
 *             dbRating={userRating}
 *             onRate={handleRatingChange}
 *             size={28}
 *             showHelperText
 *           />
 *         </div>
 *
 *         {/* Watchlist Button }
 *         <button
 *           onClick={handleWatchlistToggle}
 *           disabled={isWatchlistPending}
 *           className={`col-span-2 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
 *             isInWatchlist
 *               ? 'bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-600/50'
 *               : 'bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.2)]'
 *           }`}
 *         >
 *           <div className="flex items-center gap-3">
 *             {isWatchlistPending ? (
 *               <Loader2 className="h-5 w-5 animate-spin" />
 *             ) : isInWatchlist ? (
 *               <Check className="h-5 w-5" />
 *             ) : (
 *               <Plus className="h-5 w-5" />
 *             )}
 *           </div>
 *           <span className="truncate">{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
 *         </button>
 *
 *         {/* Add to List Button }
 *         <div className="relative col-span-2">
 *           {currentUser ? (
 *             <div ref={dropdownRef} className="w-full">
 *               <button
 *                 onClick={() => setDropdownOpen((s) => !s)}
 *                 className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors border border-neutral-700 group"
 *                 aria-expanded={dropdownOpen}
 *                 aria-haspopup="menu"
 *               >
 *                 <div className="flex items-center gap-3">
 *                   <List className="h-5 w-5 text-neutral-200" />
 *                   <span className="truncate">Add to list</span>
 *                 </div>
 *                 <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${dropdownOpen ? "-rotate-180" : ""}`} />
 *               </button>
 *
 *               {dropdownOpen && (
 *                 <div className="absolute left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden z-40">
 *                   {/* Create new list first - match list item sizing }
 *                   {!listsLoading && (
 *                     <Link
 *                       href={`/list/new?movie=${movie.id}&redirect=${encodeURIComponent(`/movies/${movie.slug}`)}`}
 *                       className="flex items-center justify-between px-3 py-2 hover:bg-neutral-800 border-b border-neutral-800 text-sm text-brand-400 truncate cursor-pointer hover:text-brand-300 hover:underline"
 *                       onClick={() => setDropdownOpen(false)}
 *                     >
 *                       Create new list
 *                     </Link>
 *                   )}
 *
 *                   {listsLoading ? (
 *                     <div className="p-3 text-center text-neutral-400">
 *                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
 *                     </div>
 *                   ) : listsError ? (
 *                     <div className="p-3 text-sm text-red-300">{listsError}</div>
 *                   ) : lists.length === 0 ? (
 *                     <div className="p-3 text-sm text-neutral-500">
 *                       <span>You have no lists.</span>
 *                     </div>
 *                   ) : (
 *                     <div className="divide-y divide-neutral-800">
 *                       {lists.map((l: SimpleList) => (
 *                         <button
 *                           key={l.id}
 *                           onClick={async (e) => {
 *                             e.preventDefault();
 *                             if (l.containsMovie) {
 *                               await handleRemoveFromList(l.id);
 *                             } else {
 *                               await handleAddToList(l.id);
 *                             }
 *                           }}
 *                           disabled={addingListId === l.id || removingListId === l.id}
 *                           aria-label={`${l.containsMovie ? "Remove" : "Add"} ${l.name} ${l.containsMovie ? "from" : "to"} list`}
 *                           className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
 *                         >
 *                           <div className="text-sm text-neutral-200 truncate">{l.name}</div>
 *                           <div className="flex items-center gap-2">
 *                             {l.containsMovie ? (
 *                               removingListId === l.id ? (
 *                                 <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
 *                               ) : (
 *                                 <Minus className="h-4 w-4 text-brand-400" />
 *                               )
 *                             ) : (
 *                               addingListId === l.id ? (
 *                                 <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
 *                               ) : (
 *                                 <Plus className="h-4 w-4 text-neutral-500 group-hover:text-brand-400" />
 *                               )
 *                             )}
 *                           </div>
 *                         </button>
 *                       ))}
 *                     </div>
 *                   )}
 *                 </div>
 *               )}
 *             </div>
 *           ) : (
 *             <Link
 *               href={`/login?redirect=/movies/${movie.slug}`}
 *               className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors border border-neutral-700 group"
 *             >
 *               <div className="flex items-center gap-3">
 *                 <List className="h-5 w-5 text-neutral-200" />
 *                 <span className="truncate">Add to list</span>
 *               </div>
 *               <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform`} />
 *             </Link>
 *           )}
 *         </div>
 *
 *       {/* Share Button }
 *       <button onClick={handleShare} disabled={!currentUser}>
 *         <i className="fa fa-share" aria-hidden="true"></i> Share
 *       </button>
 *     </div>
 *   );
 * };
 *
 * export default MovieSidebar;
 *
 *
 * Note that this is just an example and you may need to modify it to fit your specific use case.
 */
export function MovieSidebar({ movie, ratingStats, currentUser, userMovieState }: MovieSidebarProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(userMovieState?.inWatchlist ?? false);
  const [userRating, setUserRating] = useState<number | null>(userMovieState?.rating ?? null);
  const [, startRatingTransition] = useTransition();
  const [isWatchlistPending, startWatchlistTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Add to list dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  type SimpleList = { id: string; name: string; item_count?: number; containsMovie?: boolean };
  const [lists, setLists] = useState<SimpleList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const [addingListId, setAddingListId] = useState<string | null>(null);
  const [removingListId, setRemovingListId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserLists = async () => {
    if (!currentUser) return;
    setListsLoading(true);
    setListsError(null);
    try {
      const res = await fetch(`/lists/${currentUser.id}/api?type=created`);
      if (!res.ok) throw new Error("Failed to fetch lists");
      const data = await res.json();
      type RawList = { id: string; name: string; item_count?: number };
      const fetchedLists: SimpleList[] = (data.lists || []).map((l: RawList) => ({ id: l.id, name: l.name, item_count: l.item_count }));

      // Check which of these lists already contain the current movie
      if (fetchedLists.length > 0) {
        try {
          const supabase = createBrowserClient();
          const listIds = fetchedLists.map((l) => l.id);
          const { data: itemsData, error: itemsErr } = await supabase
            .from("list_items")
            .select("list_id")
            .eq("movie_id", movie.id)
            .in("list_id", listIds);

          if (!itemsErr && itemsData) {
            const presentSet = new Set(itemsData.map((it: { list_id: string }) => it.list_id));
            const annotated = fetchedLists.map((l) => ({ ...l, containsMovie: presentSet.has(l.id) }));
            setLists(annotated);
          } else {
            setLists(fetchedLists);
          }
        } catch (err) {
          console.error("Error checking list_items:", err);
          setLists(fetchedLists);
        }
      } else {
        setLists([]);
      }
    } catch (err) {
      console.error("Error fetching user lists:", err);
      setListsError("Failed to load lists");
    } finally {
      setListsLoading(false);
    }
  };

  // Fetch lists when the page loads (if user is present). Keep dropdown-open as a fallback.
  useEffect(() => {
    if (currentUser && lists.length === 0) {
      fetchUserLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, movie.id]);

  useEffect(() => {
    if (dropdownOpen && currentUser && lists.length === 0) {
      fetchUserLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen, currentUser, lists.length]);

  const handleAddToList = async (listId: string) => {
    if (!currentUser) {
      window.location.href = `/login?redirect=/movies/${movie.slug}`;
      return;
    }

    setAddingListId(listId);
    setListsError(null);

    try {
      const supabase = createBrowserClient();
      const { error: insertError } = await supabase
        .from("list_items")
        .insert({ list_id: listId, movie_id: movie.id });

      if (insertError) {
        // If duplicate, treat as already in list
        if (/(duplicate|unique)/i.test(insertError.message || "")) {
          setListsError("Movie already in the list");
          // mark list as containing the movie so UI shows green check
          setLists((prev) => prev.map((it) => (it.id === listId ? { ...it, containsMovie: true } : it)));
        } else {
          setListsError(insertError.message || "Failed to add to list");
        }
      } else {
        // mark list as containing the movie so UI shows green check immediately
        setLists((prev) => prev.map((it) => (it.id === listId ? { ...it, containsMovie: true } : it)));
      }
    } catch (err) {
      console.error("Error adding movie to list:", err);
      setListsError("An unexpected error occurred");
    } finally {
      setAddingListId(null);
    }
  };

  const handleRemoveFromList = async (listId: string) => {
    if (!currentUser) {
      window.location.href = `/login?redirect=/movies/${movie.slug}`;
      return;
    }

    setRemovingListId(listId);
    setListsError(null);

    try {
      const supabase = createBrowserClient();
      const { error: deleteError } = await supabase
        .from("list_items")
        .delete()
        .eq("list_id", listId)
        .eq("movie_id", movie.id);

      if (deleteError) {
        setListsError(deleteError.message || "Failed to remove from list");
      } else {
        // mark list as not containing the movie so UI updates immediately
        setLists((prev) => prev.map((it) => (it.id === listId ? { ...it, containsMovie: false } : it)));
      }
    } catch (err) {
      console.error("Error removing movie from list:", err);
      setListsError("An unexpected error occurred");
    } finally {
      setRemovingListId(null);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleRatingChange = async (rating: number | null) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirect=/movies/${movie.slug}`;
      return;
    }

    // Store previous rating for rollback
    const previousRating = userRating;
    
    // Optimistic update
    setUserRating(rating);
    setError(null);

    startRatingTransition(async () => {
      try {
        let result;
        if (rating === null) {
          result = await removeRating(movie.id);
        } else {
          result = await rateMovie(movie.id, rating);
        }

        if (!result.success) {
          // Rollback on error
          setUserRating(previousRating);
          setError(result.error || "Failed to save rating");
          console.error("Rating error:", result.error);
        }
      } catch (err) {
        // Rollback on unexpected error
        setUserRating(previousRating);
        setError("An unexpected error occurred");
        console.error("Rating error:", err);
      }
    });
  };

  const handleWatchlistToggle = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirect=/movies/${movie.slug}`;
      return;
    }

    // Store previous state for rollback
    const previousState = isInWatchlist;
    
    // Optimistic update
    setIsInWatchlist(!isInWatchlist);
    setError(null);

    startWatchlistTransition(async () => {
      try {
        const result = previousState
          ? await removeFromWatchlist(movie.id)
          : await addToWatchlist(movie.id);

        if (!result.success) {
          // Rollback on error
          setIsInWatchlist(previousState);
          setError(result.error || "Failed to update watchlist");
          console.error("Watchlist error:", result.error);
        }
      } catch (err) {
        // Rollback on unexpected error
        setIsInWatchlist(previousState);
        setError("An unexpected error occurred");
        console.error("Watchlist error:", err);
      }
    });
  };

  return (
    <div className="relative space-y-6">
      {/* Error Toast */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Poster - DESKTOP ONLY - Never show on mobile */}
      <div className="hidden md:block rounded-lg overflow-hidden shadow-2xl border border-neutral-800 shadow-brand-500/10">
        <div className="relative aspect-[2/3] w-full bg-neutral-800">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="h-16 w-16 text-neutral-600" />
            </div>
          )}
        </div>
      </div>

      {/* Watch Trailer Button - Full width to match poster */}
      <WatchTrailerButton
        trailerUrl={movie.trailer_url}
        movieTitle={movie.title}
        variant="primary"
        fullWidth
        hideWhenUnavailable
      />

      {/* Rating Card */}
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4">
        {ratingStats.total_ratings > 0 ? (
          <>
            <div className="flex items-end justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-[#F5C518] mb-1" fill="currentColor" />
              <span className="text-4xl font-bold text-white">
                {ratingStats.average_rating?.toFixed(1)}
              </span>
              <span className="text-sm text-neutral-400 mb-1">/ 5</span>
            </div>
            <p className="text-center text-xs text-neutral-500 mb-4">
              Based on {ratingStats.total_ratings.toLocaleString()} ratings
            </p>

            {/* Rating Distribution */}
            <RatingDistribution
              distribution={ratingStats.distribution}
              totalRatings={ratingStats.total_ratings}
              showLabels
              size="sm"
            />
          </>
        ) : (
          <div className="text-center py-4">
            <Star className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No ratings yet</p>
            <p className="text-xs text-neutral-600 mt-1">Be the first to rate!</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rate This Movie - Using react-simple-star-rating library */}
        <div className="col-span-2 flex flex-col items-center justify-center bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-lg py-4 transition-colors group">
          <span className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider group-hover:text-[#F5C518]">
            {userRating ? "Your rating" : "Rate this movie"}
          </span>
          <MovieRating
            interactive
            dbRating={userRating}
            onRate={handleRatingChange}
            size={28}
            showHelperText
          />
        </div>

        {/* Watchlist Button (match List button height/layout) */}
        <button
          onClick={handleWatchlistToggle}
          disabled={isWatchlistPending}
          className={`col-span-2 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isInWatchlist
              ? "bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-600/50"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          }`}
        >
          <div className="flex items-center gap-3">
            {isWatchlistPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isInWatchlist ? (
              <Check className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}

            <span className="truncate">{isInWatchlist ? "In Watchlist" : "Watchlist"}</span>
          </div>

          <div className="w-4" aria-hidden />
        </button>

        {/* Add to List Button (shows dropdown of user's lists) */}
        <div className="relative col-span-2">
          {currentUser ? (
            <div ref={dropdownRef} className="w-full">
              <button
                onClick={() => setDropdownOpen((s) => !s)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors border border-neutral-700 group"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <div className="flex items-center gap-3">
                  <List className="h-5 w-5 text-neutral-200" />
                  <span className="truncate">Add to list</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${dropdownOpen ? "-rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden z-40">
                  {/* Create new list first - match list item sizing */}
                  {!listsLoading && (
                    <Link
                      href={`/list/new?movie=${movie.id}&redirect=${encodeURIComponent(`/movies/${movie.slug}`)}`}
                      className="flex items-center justify-between px-3 py-2 hover:bg-neutral-800 border-b border-neutral-800 text-sm text-brand-400 truncate cursor-pointer hover:text-brand-300 hover:underline"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Create new list
                    </Link>
                  )}

                  {listsLoading ? (
                    <div className="p-3 text-center text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : listsError ? (
                    <div className="p-3 text-sm text-red-300">{listsError}</div>
                  ) : lists.length === 0 ? (
                    <div className="p-3 text-sm text-neutral-500">
                      <span>You have no lists.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-800">
                      {lists.map((l: SimpleList) => (
                        <button
                          key={l.id}
                          onClick={async (e) => {
                            e.preventDefault();
                            if (l.containsMovie) {
                              await handleRemoveFromList(l.id);
                            } else {
                              await handleAddToList(l.id);
                            }
                          }}
                          disabled={addingListId === l.id || removingListId === l.id}
                          aria-label={`${l.containsMovie ? "Remove" : "Add"} ${l.name} ${l.containsMovie ? "from" : "to"} list`}
                          className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="text-sm text-neutral-200 truncate">{l.name}</div>
                          <div className="flex items-center gap-2">
                            {l.containsMovie ? (
                              removingListId === l.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                              ) : (
                                <Minus className="h-4 w-4 text-brand-400" />
                              )
                            ) : (
                              addingListId === l.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                              ) : (
                                <Plus className="h-4 w-4 text-neutral-500 group-hover:text-brand-400" />
                              )
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/login?redirect=/movies/${movie.slug}`}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors border border-neutral-700 group"
            >
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-neutral-200" />
                <span className="truncate">Add to list</span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </Link>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="col-span-2 flex items-center justify-center gap-2 text-neutral-400 hover:text-white py-2 text-sm transition-colors relative cursor-pointer"
        >
          {showCopiedToast ? (
            <>
              <Check className="h-4 w-4 text-brand-400" />
              <span className="text-brand-400">Link copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share this movie
            </>
          )}
        </button>
      </div>
    </div>
  );
}

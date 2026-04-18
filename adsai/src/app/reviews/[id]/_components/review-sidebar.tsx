"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2, Star } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/app/movies/[id]/_lib/actions";

interface ReviewSidebarProps {
  movie: {
    id: string;
    title: string;
    poster_url: string | null;
    release_date: string | null;
    slug?: string;
  };
  currentUser: {
    id: string;
  } | null;
  isInWatchlist: boolean;
}

/**
 * * @param {ReviewSidebarProps} props - The component's props.
 *  * @param {Movie} props.movie - The movie object.
 *  * @param {User} props.currentUser - The current user object.
 *  * @param {boolean} props.isInWatchlist - The initial watchlist state.
 *  
 * export function ReviewSidebar({ movie, currentUser, isInWatchlist: initialWatchlistState }: ReviewSidebarProps) {
 *   // ... rest of the code ...
 * }
 */
export function ReviewSidebar({ movie, currentUser, isInWatchlist: initialWatchlistState }: ReviewSidebarProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialWatchlistState);
  const [isWatchlistPending, startWatchlistTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleWatchlistToggle = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirect=/reviews/${movie.id}`;
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
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow-xl">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 text-sm px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="flex gap-4 mb-6">
        {movie.slug ? (
          <Link href={`/movies/${movie.slug}`} className="shrink-0">
            <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-neutral-800">
              <Image
                src={movie.poster_url || "/placeholder-poster.jpg"}
                alt={movie.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        ) : (
          <div className="shrink-0">
            <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-neutral-800">
              <Image
                src={movie.poster_url || "/placeholder-poster.jpg"}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center">
          {movie.slug ? (
            <Link href={`/movies/${movie.slug}`}>
              <h3 className="text-lg font-bold text-white hover:text-brand-500 transition-colors leading-tight mb-1">
                {movie.title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-lg font-bold text-white leading-tight mb-1">{movie.title}</h3>
          )}
          <div className="text-neutral-400 text-sm mb-3">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : ""}
          </div>
          
          <div className="inline-flex items-center px-2 py-1 bg-neutral-800 rounded text-xs font-medium text-neutral-300 border border-neutral-700 w-fit">
            <Star className="w-3 h-3 mr-1.5 text-yellow-500 fill-yellow-500" />
            <span>3.8 Avg Rating</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {movie.slug ? (
          <Button asChild className="w-full bg-white text-black hover:bg-neutral-200 font-semibold cursor-pointer">
            <Link href={`/movies/${movie.slug}`}>View Movie Details</Link>
          </Button>
        ) : (
          <Button className="w-full bg-neutral-800 text-neutral-400" disabled>View Movie Details</Button>
        )}
        <button
          onClick={handleWatchlistToggle}
          disabled={isWatchlistPending}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isInWatchlist
              ? "bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-600/50"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          }`}
        >
          {isWatchlistPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isInWatchlist ? (
            <>
              <Check className="w-4 h-4" />
              In Watchlist
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add to Watchlist
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useQuickView } from "@/context/quick-view-modal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarRating } from "@/components/ui";
import { Info, X, Plus, Check, Loader2 } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/app/movies/[id]/_lib/actions";

interface MovieDetailsResponse {
  id: string;
  title: string;
  overview?: string | null;
  trailer_url?: string | null;
  backdrop_url?: string | null;
  release_date?: string | null;
  poster_url?: string | null;
}

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) {
    console.log('No trailer URL provided');
    return null;
  }
  
  try {
    const u = new URL(url);
    console.log('Parsing trailer URL:', url, 'hostname:', u.hostname);
    
    // support youtu.be and youtube.com
    if (u.hostname.includes("youtu.be")) {
      const embedUrl = `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      console.log('Converted youtu.be to embed:', embedUrl);
      return embedUrl;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) {
        const embedUrl = `https://www.youtube.com/embed/${v}`;
        console.log('Converted youtube.com to embed:', embedUrl);
        return embedUrl;
      }
      // maybe /embed/... already
      if (u.pathname.includes("/embed/")) {
        console.log('Already an embed URL:', url);
        return url;
      }
    }
    console.log('Not a recognized YouTube URL format');
    return null;
  } catch (e) {
    console.error('Error parsing YouTube URL:', url, e);
    return null;
  }
}

/**
 * * QuickViewModal component.
 *  *
 *  * @param {Object} props - Component properties.
 *  * @param {boolean} props.isOpen - Whether the modal is open.
 *  * @param {boolean} props.isAnimating - Whether the modal is animating.
 *  * @param {Object} props.payload - Payload data for the movie details.
 *  * @param {function} props.close - Function to close the modal.
 *  * @param {function} props.finalizeClose - Function to finalize closing the modal.
 *  
 *
 * export default function QuickViewModal(props) {
 *   const { isOpen, isAnimating, payload, close, finalizeClose } = useQuickView();
 *   const [details, setDetails] = useState<MovieDetailsResponse | null>(null);
 *   const [loading, setLoading] = useState(false);
 *   const [backdropLoaded, setBackdropLoaded] = useState(false);
 *   const router = useRouter();
 *   const [isWatchlistPending, startWatchlistTransition] = useTransition();
 *   const [isInWatchlist, setIsInWatchlist] = useState<boolean | null>(null);
 *
 *   // Whether the watchlist button can be interacted with (not pending and membership known)
 *   const canToggleWatchlist = !isWatchlistPending && isInWatchlist !== null;
 *
 *   useEffect(() => {
 *     if (!isOpen || !payload) {
 *       setDetails(null);
 *       setLoading(false);
 *       setBackdropLoaded(false);
 *       setIsInWatchlist(null);
 *       return;
 *     }
 *
 *     // Reset backdrop loaded state when modal opens
 *     setBackdropLoaded(false);
 *
 *     // fetch details (use slug when available, otherwise fallback to id)
 *     const identifier = payload.slug || payload.id;
 *     let mounted = true;
 *     setLoading(true);
 *     fetch(`/api/movie/${encodeURIComponent(identifier)}`)
 *       .then((r) => {
 *         if (!r.ok) throw new Error('Failed to fetch');
 *         return r.json();
 *       })
 *       .then((data: MovieDetailsResponse) => {
 *         if (mounted) {
 *           console.log('Movie details loaded:', data);
 *           setDetails(data);
 *         }
 *       })
 *       .catch((err) => {
 *         console.error('Error loading movie details:', err);
 *         if (mounted) setDetails(null);
 *       })
 *       .finally(() => mounted && setLoading(false));
 *
 *     return () => {
 *       mounted = false;
 *     };
 *   }, [isOpen, payload]);
 *
 *   // Close modal on Escape key press
 *   useEffect(() => {
 *     if (!isOpen) return;
 *
 *     function handleKeyDown(e: KeyboardEvent) {
 *       if (e.key === 'Escape') {
 *         close();
 *       }
 *     }
 *
 *     window.addEventListener('keydown', handleKeyDown);
 *     return () => {
 *       window.removeEventListener('keydown', handleKeyDown);
 *     };
 *   }, [isOpen, close]);
 *
 *   // Fetch watchlist membership for the current user when modal opens
 *   useEffect(() => {
 *     if (!isOpen || !payload) return;
 *
 *     // Use details.id when available (server-side ID/UUID), otherwise fallback
 *     const id = details?.id || payload.slug || payload.id;
 *
 *     let mounted = true;
 *
 *     // indicate loading state for membership (null = loading)
 *     setIsInWatchlist(null);
 *
 *     fetch(`/api/watchlist/check?movieId=${encodeURIComponent(id)}`)
 *       .then((r) => r.json())
 *       .then((data) => {
 *         if (!mounted) return;
 *         if (typeof data?.inWatchlist === 'boolean') {
 *           setIsInWatchlist(data.inWatchlist);
 *         } else {
 *           setIsInWatchlist(false);
 *         }
 *       })
 *       .catch((err) => {
 *         console.error('Error checking watchlist membership:', err);
 *         if (mounted) setIsInWatchlist(false);
 *       });
 *
 *     return () => { mounted = false; };
 *   }, [isOpen, payload, details]);
 *
 *   if (!isOpen || !payload) return null;
 *
 *   const embedUrl = getYouTubeEmbedUrl(details?.trailer_url || null);
 *
 *   // Determine a release year to render inline with the title
 *   const yearCandidate = details?.release_date
 *     ? new Date(details.release_date).getFullYear()
 *     : payload.year;
 *   const hasYear = yearCandidate !== undefined && yearCandidate !== null && yearCandidate !== "N/A";
 *
 *   // Only use the backdrop URL if it's actually a backdrop (not poster fallback)
 *   const backdropUrl = details?.backdrop_url;
 *
 *   return (
 *     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
 *       {/* Backdrop Overlay with slower transition }
 *       <div
 *         className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-out ${
 *           isAnimating ? 'opacity-100' : 'opacity-0'
 *         }`}
 *         onClick={close}
 *         onTransitionEnd={(e) => {
 *           // Only finalize when the backdrop's opacity transition completes and we're in closing state
 *           if (!isAnimating && e.propertyName && e.propertyName.includes("opacity")) {
 *             finalizeClose();
 *           }
 *         }}
 *       />
 *
 *       {/* Modal Dialog - Vertical Flex Column with faster transition }
 *       <div className={`relative z-10 w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ease-out ${
 *         isAnimating ? 'opacity-100' : 'opacity-0'
 *       }`}>
 *         {/* Content Body }
 *         <div className="p-6 md:p-8 bg-neutral-900">
 *           {/* Synopsis - Reserve minimum space to prevent layout shift }
 *           <div>
 *             <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
 *             <div className="min-h-[60px]">
 *               {loading ? (
 *                 <div className="space-y-2 animate-pulse">
 *                   <div className="h-4 bg-neutral-800 rounded w-full"></div>
 *                   <div className="h-4 bg-neutral-800 rounded w-full"></div>
 *                   <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
 *                 </div>
 *               ) : details?.overview ? (
 *                 <p className="text-neutral-300 text-sm leading-relaxed">{details.overview}</p>
 *               ) : (
 *                 <p className="text-neutral-500 text-sm italic">No synopsis available.</p>
 *               )}
 *             </div>
 *           </div>
 *
 *           {/* Trailer Section - Always reserve space even if no trailer }
 *           <div className="px-6 md:px-8 pb-6 md:pb-8 bg-neutral-900">
 *             {loading ? (
 *               <>
 *                 <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
 *                 <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center animate-pulse">
 *                   <div className="text-neutral-600 text-sm">Loading trailer...</div>
 *                 </div>
 *               </>
 *             ) : embedUrl ? (
 *               <>
 *                 <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
 *                 <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black">
 *                   <iframe
 *                     src={embedUrl}
 *                     title={`${payload.title} trailer`}
 *                     frameBorder={0}
 *                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 *                     allowFullScreen
 *                     className="w-full h-full"
 *                   />
 *                 </div>
 *               </>
 *             ) : null}
 *           </div>
 *         </div>
 *
 *         {/* Content Body }
 *         <div className="p-6 md:p-8 bg-neutral-900">
 *           {/* Synopsis - Reserve minimum space to prevent layout shift }
 *           <div>
 *             <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
 *             <div className="min-h-[60px]">
 *               {loading ? (
 *                 <div className="space-y-2 animate-pulse">
 *                   <div className="h-4 bg-neutral-800 rounded w-full"></div>
 *                   <div className="h-4 bg-neutral-800 rounded w-full"></div>
 *                   <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
 *                 </div>
 *               ) : details?.overview ? (
 *                 <p className="text-neutral-300 text-sm leading-relaxed">{details.overview}</p>
 *               ) : (
 *                 <p className="text-neutral-500 text-sm italic">No synopsis available.</p>
 *               )}
 *             </div>
 *           </div>
 *
 *           {/* Trailer Section - Always reserve space even if no trailer }
 *           <div className="px-6 md:px-8 pb-6 md:pb-8 bg-neutral-900">
 *             {loading ? (
 *               <>
 *                 <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
 *                 <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center animate-pulse">
 *                   <div className="text-neutral-600 text-sm">Loading trailer...</div>
 *                 </div>
 *               </>
 *             ) : embedUrl ? (
 *               <>
 *                 <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
 *                 <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black">
 *                   <iframe
 *                     src={embedUrl}
 *                     title={`${payload.title} trailer`}
 *                     frameBorder={0}
 *                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 *                     allowFullScreen
 *                     className="w-full h-full"
 *                   />
 *                 </div>
 *               </>
 *             ) : null}
 *           </div>
 *         </div>
 *
 *         {/* Actions }
 *         <div className="p-6 md:p-8 bg-neutral-900">
 *           <button
 *             onClick={() => {
 *               close();
 *               router.push(`/movies/${payload.slug}`);
 *             }}
 *             className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-700 text-white hover:bg-neutral-800/60 font-semibold h-10 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 drop-shadow-lg cursor-pointer"
 *           >
 *             <span className="inline-flex items-center justify-center gap-2 w-full h-full">
 *               <Info className="h-4 w-4" />
 *               <span className="text-sm">More Info</span>
 *             </span>
 *           </button>
 *
 *           <button
 *             onClick={() => {
 *               close();
 *               router.push(`/movies/${payload.slug}`);
 *             }}
 *             disabled={isWatchlistPending || isInWatchlist === null}
 *             aria-pressed={!!isInWatchlist}
 *             className={`${
 *               isInWatchlist
 *                 ? `bg-brand-600/20 text-brand-400 border border-brand-600/50 ${canToggleWatchlist ? 'hover:bg-brand-600/30' : ''}`
 *                 : `bg-brand-600 ${canToggleWatchlist ? 'hover:bg-brand-500' : ''} text-white`
 *             } h-10 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${canToggleWatchlist ? 'cursor-pointer' : 'cursor-default'} disabled:opacity-50`}
 *           >
 *             <span className="inline-flex items-center justify-center gap-2 w-full h-full">
 *               {isInWatchlist === null ? (
 *                 <Loader2 className="h-4 w-4 animate-spin" />
 *               ) : isInWatchlist ? (
 *                 <Check className="h-4 w-4" />
 *               ) : (
 *                 <Plus className="h-4 w-4" />
 *               )}
 *               <span className="text-sm">{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
 *             </span>
 *           </button>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 */
export default function QuickViewModal() {
  const { isOpen, isAnimating, payload, close, finalizeClose } = useQuickView();
  const [details, setDetails] = useState<MovieDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const router = useRouter();
  const [isWatchlistPending, startWatchlistTransition] = useTransition();
  const [isInWatchlist, setIsInWatchlist] = useState<boolean | null>(null);

  // Whether the watchlist button can be interacted with (not pending and membership known)
  const canToggleWatchlist = !isWatchlistPending && isInWatchlist !== null;

  useEffect(() => {
    if (!isOpen || !payload) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when modal closes is intentional
      setDetails(null);
       
      setLoading(false);
       
      setBackdropLoaded(false);
       
      setIsInWatchlist(null);
      return;
    }

    // Reset backdrop loaded state when modal opens
    setBackdropLoaded(false);

    // fetch details (use slug when available, otherwise fallback to id)
    const identifier = payload.slug || payload.id;
    let mounted = true;
    setLoading(true);
    fetch(`/api/movie/${encodeURIComponent(identifier)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data: MovieDetailsResponse) => {
        if (mounted) {
          console.log('Movie details loaded:', data);
          setDetails(data);
        }
      })
      .catch((err) => {
        console.error('Error loading movie details:', err);
        if (mounted) setDetails(null);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [isOpen, payload]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);
  // Fetch watchlist membership for the current user when modal opens
  // Prefer the canonical `details.id` (if available) to match what's stored
  // in the DB; fall back to `payload.slug` or `payload.id`. Re-run when
  // `details` changes so we pick up the canonical identifier after details load.
  useEffect(() => {
    if (!isOpen || !payload) return;

    // Use details.id when available (server-side ID/UUID), otherwise fallback
    const id = details?.id || payload.slug || payload.id;

    let mounted = true;

    // indicate loading state for membership (null = loading)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setting loading indicator before async fetch
    setIsInWatchlist(null);

    fetch(`/api/watchlist/check?movieId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (typeof data?.inWatchlist === 'boolean') {
          setIsInWatchlist(data.inWatchlist);
        } else {
          setIsInWatchlist(false);
        }
      })
      .catch((err) => {
        console.error('Error checking watchlist membership:', err);
        if (mounted) setIsInWatchlist(false);
      });

    return () => { mounted = false; };
  }, [isOpen, payload, details]);

  if (!isOpen || !payload) return null;

  const embedUrl = getYouTubeEmbedUrl(details?.trailer_url || null);

  // Determine a release year to render inline with the title
  const yearCandidate = details?.release_date
    ? new Date(details.release_date).getFullYear()
    : payload.year;
  const hasYear = yearCandidate !== undefined && yearCandidate !== null && yearCandidate !== "N/A";

  // Only use the backdrop URL if it's actually a backdrop (not poster fallback)
  const backdropUrl = details?.backdrop_url;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop Overlay with slower transition */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
        onTransitionEnd={(e) => {
          // Only finalize when the backdrop's opacity transition completes and we're in closing state
          if (!isAnimating && e.propertyName && e.propertyName.includes("opacity")) {
            finalizeClose();
          }
        }}
      />

      {/* Modal Dialog - Vertical Flex Column with faster transition */}
      <div className={`relative z-10 w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Section: Backdrop Behind Header */}
          <div className="relative">
            {/* Backdrop Image - only show when loaded, fade in smoothly */}
            {backdropUrl && backdropLoaded && (
              <div className="absolute inset-0 w-full h-full animate-in fade-in duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element -- external dynamic image URL */}
                <img 
                  src={backdropUrl} 
                  alt={payload.title}
                  className="w-full h-full object-cover"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-neutral-900" />
              </div>
            )}
            
            {/* Hidden preloader for backdrop image */}
            {backdropUrl && !backdropLoaded && (
              // eslint-disable-next-line @next/next/no-img-element -- preloader for external image
              <img 
                src={backdropUrl} 
                alt=""
                className="hidden"
                onLoad={() => setBackdropLoaded(true)}
                onError={() => setBackdropLoaded(false)}
              />
            )}

            {/* Header Content (Over Backdrop or solid background) */}
            <div className="relative z-10 p-6 md:p-8 pt-16 md:pt-20 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Row 1: Title + Year (title links to movie page) */}
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    <Link
                      href={`/movies/${payload.slug}`}
                      onClick={() => {
                        close();
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      {payload.title}
                    </Link>
                    {hasYear && (
                      <span className="text-neutral-300 font-normal ml-2">({yearCandidate})</span>
                    )}
                  </h2>

                  {/* Row 2: Match % + Star Rating */}
                  <div className="mt-3 flex items-center gap-4">
                    {/* Match Percentage (only if exists) */}
                    {payload.matchPercentage !== undefined && payload.matchPercentage !== null && (
                      <span className="text-green-400 font-semibold text-sm drop-shadow-md">
                        {Math.round(payload.matchPercentage)}% Match
                      </span>
                    )}

                    {/* Star Rating */}
                    {payload.rating !== undefined && payload.rating !== null && (
                      <div className="flex items-center gap-2">
                        <StarRating value={payload.rating} size="sm" color="brand" />
                        <span className="text-neutral-300 text-sm drop-shadow-md">{payload.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Watchlist + More Info */}
                <div className="flex flex-row md:flex-row items-center gap-3 flex-wrap mt-3 md:mt-0 justify-start">
                  <button
                    onClick={() => {
                      // Prevent toggling while initial membership is loading
                      if (isInWatchlist === null) return;

                      // Optimistic update: flip locally first, then call server.
                      const prev = !!isInWatchlist;
                      setIsInWatchlist(!prev);

                      startWatchlistTransition(async () => {
                        try {
                          const id = details?.id || payload.id;
                          let result;
                          if (prev) {
                            result = await removeFromWatchlist(id);
                          } else {
                            result = await addToWatchlist(id);
                          }

                          if (!result.success) {
                            // Rollback optimistic update
                            setIsInWatchlist(prev);

                            // If not authenticated, redirect to login
                            if (result.error && result.error.toLowerCase().includes('log')) {
                              window.location.href = `/login?redirect=/movies/${payload.slug}`;
                              return;
                            }

                            console.error('Watchlist update failed:', result.error);
                          }
                          // on success, optimistic state is already correct
                        } catch (err) {
                          // rollback on unexpected errors
                          setIsInWatchlist(prev);
                          console.error('Error toggling watchlist:', err);
                        }
                      });
                    }}
                    disabled={isWatchlistPending || isInWatchlist === null}
                    aria-pressed={!!isInWatchlist}
                    className={`${
                      isInWatchlist
                        ? `bg-brand-600/20 text-brand-400 border border-brand-600/50 ${canToggleWatchlist ? 'hover:bg-brand-600/30' : ''}`
                        : `bg-brand-600 ${canToggleWatchlist ? 'hover:bg-brand-500' : ''} text-white`
                    } h-10 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${canToggleWatchlist ? 'cursor-pointer' : 'cursor-default'} disabled:opacity-50 flex-shrink-0 w-28`}
                  >
                    <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                      {isInWatchlist === null ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="text-sm">{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      close();
                      router.push(`/movies/${payload.slug}`);
                    }}
                    className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-700 text-white hover:bg-neutral-800/60 font-semibold h-10 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 drop-shadow-lg cursor-pointer flex-shrink-0 w-28"
                  >
                    <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                      <Info className="h-4 w-4" />
                      <span className="text-sm">More Info</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 bg-neutral-900">
            {/* Synopsis - Reserve minimum space to prevent layout shift */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
              <div className="min-h-[60px]">
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                    <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  </div>
                ) : details?.overview ? (
                  <p className="text-neutral-300 text-sm leading-relaxed">{details.overview}</p>
                ) : (
                  <p className="text-neutral-500 text-sm italic">No synopsis available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Trailer Section - Always reserve space even if no trailer */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 bg-neutral-900">
            {loading ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center animate-pulse">
                  <div className="text-neutral-600 text-sm">Loading trailer...</div>
                </div>
              </>
            ) : embedUrl ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black">
                  <iframe
                    src={embedUrl}
                    title={`${payload.title} trailer`}
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

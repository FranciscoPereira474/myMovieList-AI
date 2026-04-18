"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarRating, WatchTrailerButton } from "@/components/ui";
import { Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendingMovie } from "../_lib/queries";

interface HeroSectionProps {
  movies: TrendingMovie[];
}

const SLIDE_DURATION = 6000; // 6 seconds per slide
const TRANSITION_DURATION = 500; // 500ms for fade transition

/**
 * * HeroSection component.
 *  *
 *  * @param {HeroSectionProps} props - Component props.
 *  * @returns {JSX.Element} The rendered HeroSection component.
 *  
 * export function HeroSection({ movies }: HeroSectionProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0); // The index actually being displayed (updates after fade out)
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wheelCooldownRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [releaseTo, setReleaseTo] = useState<number | null>(null); // 1 -> next (swipe left), -1 -> prev (swipe right)
  const releaseTimeoutRef = useRef<number | null>(null);
  const [releaseStartOffset, setReleaseStartOffset] = useState(0);
  const [dragTriggered, setDragTriggered] = useState(false);
  const [snapInstant, setSnapInstant] = useState(false);
  const snapTimeoutRef = useRef<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const displayMovie = movies[displayIndex];

  // Track container width for use in render (avoid accessing ref during render)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      
      // Start fade out
      setIsTransitioning(true);
      pendingIndexRef.current = index;
      setCurrentIndex(index);
      
      // Wait for fade out, then update displayed content
      setTimeout(() => {
        if (pendingIndexRef.current !== null) {
          setDisplayIndex(pendingIndexRef.current);
          pendingIndexRef.current = null;
        }
        // Wait a tiny bit, then fade in
        setTimeout(() => {
          setIsTransitioning(false);
          // Clear the drag-triggered marker once the transition fully finishes
          setDragTriggered(false);
        }, 50);
      }, TRANSITION_DURATION);
    },
    [isTransitioning, currentIndex]
  );

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % movies.length;
    goToSlide(nextIndex);
  }, [currentIndex, movies.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + movies.length) % movies.length;
    goToSlide(prevIndex);
  }, [currentIndex, movies.length, goToSlide]);

  // Auto-advance slideshow
  useEffect(() => {
    if (isPaused || movies.length <= 1 || isTransitioning) return;

    const timer = setInterval(goToNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, movies.length, isTransitioning]);


  // Pointer (mouse/touch) drag handlers for click-drag and touch swipe
  const SWIPE_THRESHOLD = 50; // px

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (isTransitioning) return;
    // only primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // If the pointerdown originated on an interactive control, don't start a drag here.
    const target = e.target as HTMLElement | null;
    if (target && target.closest && target.closest('button, a, [role="button"], input, textarea, select')) {
      return;
    }

    pointerIdRef.current = e.pointerId;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore if not supported
    }
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsPaused(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current || pointerIdRef.current !== e.pointerId) return;

    const deltaX = e.clientX - startXRef.current;
    const el = containerRef.current;
    const width = el?.clientWidth ?? 0;
    const max = Math.max(80, Math.floor(width * 0.18));
    const clamped = Math.max(-max, Math.min(max, deltaX));
    setDragOffset(clamped);
  };

  const finishPointer = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - startXRef.current;
    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setIsPaused(false);
    setIsDragging(false);
    // If the gesture was small, snap back
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      // allow a small release animation back to neutral
      const reset = () => setDragOffset(0);
      setTimeout(reset, 120);
      return;
    }

    // Determine direction: swiping left (deltaX < 0) => next, swiping right => prev
    const isNext = deltaX < 0;

    // Start a short release animation that completes the fade/move even if the user
    // didn't drag all the way to the max offset. We want to freeze horizontal position
    // during the release (use the offset at release time) and animate vertical + opacity
    // to completion. After the fade completes, snap horizontal back to 0 instantly
    // (while still invisible).
    const dir = isNext ? 1 : -1; // 1 => next (left), -1 => prev (right)
    setReleaseTo(dir);
    setReleaseStartOffset(dragOffset); // freeze horizontal based on current drag

    const RELEASE_ANIM_MS = 260;
    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }
    releaseTimeoutRef.current = window.setTimeout(() => {
      // After release animation completes, snap horizontal back to original instantly
      setReleaseTo(null);
      // ensure any previous snap timeout is cleared
      if (snapTimeoutRef.current) {
        window.clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
      setSnapInstant(true);
      // set dragOffset to 0 (horizontal snap) while we have snapInstant=true so it doesn't animate
      setDragOffset(0);
      snapTimeoutRef.current = window.setTimeout(() => {
        setSnapInstant(false);
        snapTimeoutRef.current = null;
      }, 30);

      releaseTimeoutRef.current = null;
    }, RELEASE_ANIM_MS + 20);

    // Trigger the actual slide change
    // Mark that this transition was triggered by a drag so we can suppress
    // the default downward translate during the outgoing fade.
    setDragTriggered(true);
    if (isNext) goToNext(); else goToPrev();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== e.pointerId) return finishPointer(e.clientX);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    finishPointer(e.clientX);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setIsPaused(false);
    setIsDragging(false);
    setDragOffset(0);
  };

  // Wheel handler for two-finger trackpad horizontal swipes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const MIN_HORIZONTAL = 6; // px - lower threshold so we catch trackpad gestures early

    const onWheel = (ev: WheelEvent) => {
      if (movies.length <= 1) return;

      const absX = Math.abs(ev.deltaX);
      const absY = Math.abs(ev.deltaY);

      // Only handle predominantly horizontal gestures
      if (absX <= absY || absX < MIN_HORIZONTAL) return;

      // If the event can be canceled, prevent default immediately to stop browser navigation
      if (ev.cancelable) {
        try {
          ev.preventDefault();
          ev.stopPropagation();
        } catch {
          // ignore
        }
      }

      if (wheelCooldownRef.current) return;
      wheelCooldownRef.current = true;
      setTimeout(() => (wheelCooldownRef.current = false), 300);

      // If a transition is in progress, we've prevented navigation above but
      // should not trigger another slide change until it finishes.
      if (isTransitioning) return;

      // Invert horizontal wheel direction only (trackpad): deltaX < 0 -> previous, deltaX > 0 -> next
      if (ev.deltaX < 0) {
        goToPrev();
      } else {
        goToNext();
      }
    };

    // Use capture phase so we intercept gestures before the browser history handler
    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, [goToNext, goToPrev, isTransitioning, movies.length]);


  // Keep the raw rating and compute a normalized 0-5 value for display.
  // Some sources provide 0-10 (TMDB) while others may already be 0-5.
  const rawRating = displayMovie.average_rating ?? 0;
  const normalizedRating = rawRating > 5 && rawRating <= 10 ? rawRating / 2 : rawRating;

  // Always render the same wrapper structure for consistent hydration
  // The conditional content is handled inside
  return (
    <section
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="relative w-full h-[85vh] md:h-[75vh] flex items-end group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none', overscrollBehavior: 'none' }}
    >
      {/* Empty state background */}
      {!displayMovie && (
        <div className="absolute inset-0 bg-neutral-900" />
      )}
      {/* Background Images with Crossfade */}
      {movies.map((m, index) => (
        <div
          key={m.id}
          className={cn(
            "absolute inset-0 z-0 transition-opacity duration-700 ease-in-out",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          {m.backdrop_url ? (
            <Image
              src={m.backdrop_url}
              alt={m.title}
              fill
              className="object-cover opacity-60"
              priority={index === 0}
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
        </div>
      ))}

      {/* Gradients for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent z-[1]" />

      {/* Navigation Arrows - Pure CSS visibility, decoupled from React state */}
      {movies.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-neutral-900/70 backdrop-blur-sm border border-neutral-700 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 hover:bg-neutral-800 cursor-pointer shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Content with Fade Transition */}
      {displayMovie && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div
            className={cn(
              "max-w-2xl space-y-4 transition-all duration-500 ease-in-out",
              isTransitioning
                ? // If the transition was started by a drag, keep vertical position locked
                  dragTriggered
                  ? "opacity-0 translate-y-0"
                  : "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            )}
            // While user is dragging or releasing, override opacity/translate with inline styles
            style={(() => {
              const max = Math.max(80, Math.floor(containerWidth * 0.18));

              // If neither dragging, releasing, nor snapping, don't override styles
              if (!isDragging && releaseTo === null && !snapInstant) return undefined;

              const MAX_TRANSLATE_X = 24; // px horizontal shift to emphasize direction

              // While the user is actively dragging, base everything on the live dragOffset
              if (isDragging) {
                const currentOffset = dragOffset;
                const progress = max > 0 ? Math.min(1, Math.abs(currentOffset) / max) : 0;
                const translateX = (currentOffset / Math.max(1, max)) * MAX_TRANSLATE_X;
                const opacity = Math.max(0, 1 - progress);

                return {
                  transform: `translateX(${translateX}px)`,
                  opacity,
                  transitionProperty: 'none',
                } as React.CSSProperties;
              }

              // If this transition was triggered by a drag, and we're in the
              // global transitioning state, keep the outgoing slide from moving
              // vertically until the swap is complete. Use the captured release
              // offset (or current dragOffset) and animate opacity to 0.
              if (dragTriggered && isTransitioning) {
                const startOffset = releaseStartOffset || dragOffset || 0;
                const translateX = (startOffset / Math.max(1, max)) * MAX_TRANSLATE_X;
                const opacity = 0;
                return {
                  transform: `translateX(${translateX}px)`,
                  opacity,
                  transition: 'transform 220ms ease, opacity 220ms ease',
                } as React.CSSProperties;
              }

              // During release: freeze horizontal at the offset captured at release start
              // Animate opacity to 0 but do NOT move the content vertically.
              if (releaseTo !== null) {
                const startOffset = releaseStartOffset || 0;
                const translateX = (startOffset / Math.max(1, max)) * MAX_TRANSLATE_X;
                const opacity = 0; // animate to fully transparent

                return {
                  transform: `translateX(${translateX}px)`,
                  opacity,
                  transition: 'transform 220ms ease, opacity 220ms ease',
                } as React.CSSProperties;
              }

              // Snap instant: after fade completes, snap horizontal back to 0 immediately
              if (snapInstant) {
                const opacity = 0;
                return {
                  transform: `translateX(0px)`,
                  opacity,
                  transitionProperty: 'none',
                } as React.CSSProperties;
              }
            })()}
          >
            {/* Badges */}
            <div className="flex items-center gap-3">
              <span className="bg-brand-500 text-black text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Trending #{displayIndex + 1}
              </span>
              {displayMovie.average_rating && (
                <div className="flex items-center gap-2">
                  <StarRating value={normalizedRating} size="sm" color="brand" />
                  <span className="text-neutral-300 text-sm">
                    {displayMovie.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-xl">
              {displayMovie.title}
            </h1>

            {/* Overview */}
            {displayMovie.overview && (
              <p className="text-lg text-neutral-300 line-clamp-3 md:line-clamp-2 drop-shadow-md">
                {displayMovie.overview}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <WatchTrailerButton
                trailerUrl={displayMovie.trailer_url}
                movieTitle={displayMovie.title}
                variant="primary"
              />

              <Link
                href={`/movies/${displayMovie.slug}`}
                className="bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 text-white hover:bg-neutral-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Info size={18} />
                More Info
              </Link>
            </div>
          </div>

          {/* Slide Indicators */}
          {movies.length > 1 && (
            <div className="flex items-center gap-2 mt-8">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-brand-500"
                      : "w-2 bg-neutral-600 hover:bg-neutral-500 cursor-pointer"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

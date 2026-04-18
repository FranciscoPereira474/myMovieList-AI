"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HorizontalScrollCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show navigation arrows */
  showArrows?: boolean;
  /** Gap between items (Tailwind class) */
  gap?: "gap-2" | "gap-3" | "gap-4" | "gap-6";
  /** Whether to enable snap scrolling */
  snap?: boolean;
  /** Enable infinite looping with cloned items */
  infinite?: boolean;
}

/**
 * * @param {HorizontalScrollCarouselProps} props
 *  * @returns {JSX.Element}
 *  
 * export function HorizontalScrollCarousel({
 *   children,
 *   showArrows = true,
 *   gap = "gap-4",
 *   snap = true,
 *   infinite = true,
 *   className,
 *   ...props
 * }: HorizontalScrollCarouselProps) {
 *   // Derive side padding class from the gap prop so edge spacing matches
 *   // the spacing between items. E.g. "gap-4" -> "px-4".
 *   const sidePadding = gap.replace(/^gap-/, "px-");
 *   const scrollRef = React.useRef<HTMLDivElement>(null);
 *   const [showLeftArrow, setShowLeftArrow] = React.useState(false);
 *   const [showRightArrow, setShowRightArrow] = React.useState(true);
 *   const isScrollingRef = React.useRef(false);
 *
 *   // ... (rest of the code remains the same)
 */
export function HorizontalScrollCarousel({
  children,
  showArrows = true,
  gap = "gap-4",
  snap = true,
  infinite = true,
  className,
  ...props
}: HorizontalScrollCarouselProps) {
  // Derive side padding class from the gap prop so edge spacing matches
  // the spacing between items. E.g. "gap-4" -> "px-4".
  const sidePadding = gap.replace(/^gap-/, "px-");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);
  const isScrollingRef = React.useRef(false);

  const childArray = React.Children.toArray(children);
  const itemCount = childArray.length;
  
  // For infinite scroll, we clone items at the start and end
  const cloneCount = infinite ? Math.min(3, itemCount) : 0;

  // Build the items array with clones for infinite scrolling
  const items = React.useMemo(() => {
    if (!infinite || itemCount === 0) {
      return childArray;
    }
    
    // Clone last N items to prepend, and first N items to append
    const startClones = childArray.slice(-cloneCount);
    const endClones = childArray.slice(0, cloneCount);
    
    return [...startClones, ...childArray, ...endClones];
  }, [childArray, infinite, itemCount, cloneCount]);

  const checkScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (infinite) {
        // Always show arrows when infinite
        setShowLeftArrow(true);
        setShowRightArrow(true);
      } else {
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
      }
    }
  }, [infinite]);

  // Handle seamless looping
  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current || !infinite || isScrollingRef.current || itemCount === 0) return;
    
    const container = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Get approximate item width (including gap)
    const totalItemsWidth = scrollWidth;
    const cloneSetWidth = (totalItemsWidth / items.length) * cloneCount;
    const realContentStart = cloneSetWidth;
    const realContentEnd = scrollWidth - cloneSetWidth - clientWidth;
    
    // When scrolled to the prepended clones, jump to the real items at the end
    if (scrollLeft < realContentStart - 10) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft + (scrollWidth - (cloneSetWidth * 2));
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
    // When scrolled to the appended clones, jump to the real items at the start
    else if (scrollLeft > realContentEnd + 10) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft - (scrollWidth - (cloneSetWidth * 2));
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
    
    checkScroll();
  }, [infinite, itemCount, items.length, cloneCount, checkScroll]);

  // Initialize scroll position to show real items (skip prepended clones)
  React.useEffect(() => {
    if (scrollRef.current && infinite && itemCount > 0) {
      const container = scrollRef.current;
      const totalItemsWidth = container.scrollWidth;
      const cloneSetWidth = (totalItemsWidth / items.length) * cloneCount;
      container.scrollLeft = cloneSetWidth;
    }
  }, [infinite, itemCount, items.length, cloneCount]);

  React.useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        scrollEl.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll, handleScroll]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("relative group/carousel", className)} {...props}>
      {/* Edge fade masks - adjusted to not clip card content */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 z-10 bg-gradient-to-l from-neutral-950 via-neutral-950/50 to-transparent" />

      {/* Scroll Container - added pt-2 for hover scale room */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto pt-2 pb-4",
          sidePadding,
          gap,
          snap && "snap-x snap-mandatory",
          // Hide scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
      >
        {items.map((child, index) => (
          <div key={`item-${index}`} className={cn(snap && "snap-start shrink-0")}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && itemCount > 0 && (
        <>
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-700 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-neutral-800 cursor-pointer shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-900/90 border border-neutral-700 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-neutral-800 cursor-pointer shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

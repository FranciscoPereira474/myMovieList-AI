"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MovieCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between slides */
  gap?: "sm" | "md" | "lg";
  /** Enable navigation arrows */
  showArrows?: boolean;
  /** Enable edge gradient masks */
  showMasks?: boolean;
  /** Enable infinite loop scrolling (default: true) */
  loop?: boolean;
}

const gapStyles = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

/**
 * * @param {MovieCarouselProps} props - The component's properties.
 *  * @param {React.ReactNode} props.children - The carousel items.
 *  * @param {string} [props.gap="md"] - The gap between slides.
 *  * @param {boolean} [props.showArrows=true] - Whether to show navigation arrows.
 *  * @param {boolean} [props.showMasks=true] - Whether to show edge masks.
 *  * @param {boolean} [props.loop=true] - Whether the carousel should loop.
 *  * @param {string} [props.className] - Additional CSS class names for the component.
 *  
 * export function MovieCarousel({
 *   children,
 *   gap = "md",
 *   showArrows = true,
 *   showMasks = true,
 *   loop = true,
 *   className,
 *   ...props
 * }: MovieCarouselProps) {
 *   // ... rest of your code ...
 * }
 */
export function MovieCarousel({
  children,
  gap = "md",
  showArrows = true,
  showMasks = true,
  loop = true,
  className,
  ...props
}: MovieCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop,
      align: "start",
      slidesToScroll: 1,
      containScroll: loop ? false : "trimSnaps",
      dragFree: true,
    },
    [WheelGesturesPlugin()]
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const childArray = React.Children.toArray(children);

  if (childArray.length === 0) return null;

  return (
    <div className={cn("relative group/carousel", className)} {...props}>
      {/* Edge fade masks */}
      {showMasks && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 md:w-12 z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 md:w-12 z-10 bg-gradient-to-l from-neutral-950 via-neutral-950/70 to-transparent" />
        </>
      )}

      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Embla Container - derive side padding from gap so edges match item gaps */}
        <div
          className={cn(
            "flex py-2",
            // Convert e.g. "gap-4" -> "px-4" so side padding equals gap
            gapStyles[gap].replace(/^gap-/, "px-"),
            gapStyles[gap]
          )}
        >
          {childArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 min-w-0"
              style={{ flex: "0 0 auto" }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && childArray.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-neutral-800 hover:scale-110 cursor-pointer shadow-lg disabled:hidden"
            aria-label="Previous slides"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-neutral-800 hover:scale-110 cursor-pointer shadow-lg disabled:hidden"
            aria-label="Next slides"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

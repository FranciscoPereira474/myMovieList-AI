"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Colors
const GOLD_COLOR = "#f5c518";
const GRAY_COLOR = "#0a0a0a";

interface MovieRatingProps {
  /** Rating value from DB (1-10 scale, 0 or null means no rating) */
  dbRating?: number | null;
  /** Whether the rating is interactive (user can click to rate) */
  interactive?: boolean;
  /** Callback when user rates (returns 1-10 scale value, or null if removed) */
  onRate?: (rating: number | null) => void;
  /** Size of the stars in pixels */
  size?: number;
  /** Show the numeric value next to stars */
  showValue?: boolean;
  /** Show helper text when user has a rating set */
  showHelperText?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Star SVG component with support for full, half, and empty fill states
 */
function StarIcon({
  size,
  fillType,
}: {
  size: number;
  fillType: "empty" | "half" | "full";
}) {
  const gradientId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-100"
    >
      {fillType === "half" && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor={GOLD_COLOR} />
            <stop offset="50%" stopColor={GRAY_COLOR} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          fillType === "full"
            ? GOLD_COLOR
            : fillType === "half"
              ? `url(#${gradientId})`
              : GRAY_COLOR
        }
      />
    </svg>
  );
}

/**
 * Movie rating component with hover preview and click to set.
 * Accepts DB rating (1-10 scale) and displays as 5 stars with half-star support.
 */
export function MovieRating({
  dbRating = 0,
  interactive = false,
  onRate,
  size = 24,
  showValue = false,
  showHelperText = false,
  className,
}: MovieRatingProps) {
  // Convert DB rating (1-10) to display rating (0-5) with 0.5 step
  const ratingFromProp = dbRating ? dbRating / 2 : 0;

  const [currentRating, setCurrentRating] = useState<number>(ratingFromProp);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [lastDbRating, setLastDbRating] = useState<number | null>(dbRating);

  // Sync internal state with external dbRating prop using state comparison
  if (dbRating !== lastDbRating) {
    setLastDbRating(dbRating);
    setCurrentRating(dbRating ? dbRating / 2 : 0);
  }

  // Display hover rating when hovering, otherwise show current rating
  const displayRating = hoverRating || currentRating;

  /**
   * Determine fill type for each star based on the display rating
   */
  function getStarFill(starIndex: number): "empty" | "half" | "full" {
    const starValue = starIndex + 1;

    if (displayRating >= starValue) return "full";
    if (displayRating >= starValue - 0.5) return "half";
    return "empty";
  }

  /**
   * Handle mouse movement over a star to determine half/full hover
   */
  function handleStarHover(
    starIndex: number,
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (!interactive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    // Left half = starIndex + 0.5, Right half = starIndex + 1
    const rating = starIndex + (isLeftHalf ? 0.5 : 1);
    setHoverRating(rating);
  }

  /**
   * Handle click on a star - toggle if same rating, otherwise set new rating
   */
  function handleStarClick(
    starIndex: number,
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (!interactive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    const clickedRating = starIndex + (isLeftHalf ? 0.5 : 1);

    // Toggle: if clicking the same rating, remove it
    if (currentRating === clickedRating) {
      setCurrentRating(0);
      onRate?.(null);
    } else {
      setCurrentRating(clickedRating);
      // Convert back to DB scale (1-10)
      const dbValue = Math.round(clickedRating * 2);
      onRate?.(dbValue);
    }
  }

  /**
   * Reset hover state when mouse leaves the star container
   */
  function handleMouseLeave() {
    if (!interactive) return;
    setHoverRating(0);
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        {/* Stars Container */}
        <div
          className={cn(
            "flex gap-1",
            interactive && "cursor-pointer"
          )}
          onMouseLeave={handleMouseLeave}
        >
          {[0, 1, 2, 3, 4].map((starIndex) => (
            <div
              key={starIndex}
              className={cn(
                "relative",
                interactive && "hover:scale-110 transition-transform duration-100"
              )}
              style={{ width: size, height: size }}
              onMouseMove={(e) => handleStarHover(starIndex, e)}
              onClick={(e) => handleStarClick(starIndex, e)}
            >
              <StarIcon size={size} fillType={getStarFill(starIndex)} />
            </div>
          ))}
        </div>

        {/* Numeric Value */}
        {showValue && currentRating > 0 && (
          <span
            className="text-sm font-semibold"
            style={{ color: GOLD_COLOR }}
          >
            {currentRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Helper Text */}
      {showHelperText && currentRating > 0 && (
        <span className="text-xs text-neutral-500">
          Click on the same rating to remove
        </span>
      )}
    </div>
  );
}

/**
 * Display-only rating (non-interactive) for showing average ratings.
 * Renders only filled/half stars (no empty stars) for compact display.
 */
export function MovieRatingDisplay({
  dbRating,
  size = 16,
  className,
}: {
  dbRating: number | null;
  size?: number;
  className?: string;
}) {
  if (!dbRating) return null;

  // Convert DB rating (1-10) to 5-star scale
  const displayRating = dbRating / 2;

  /**
   * Determine fill type for each star
   */
  function getStarFill(starIndex: number): "empty" | "half" | "full" {
    const starValue = starIndex + 1;

    if (displayRating >= starValue) return "full";
    if (displayRating >= starValue - 0.5) return "half";
    return "empty";
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const fillType = getStarFill(starIndex);
        // Skip rendering empty stars in display mode for compact view
        if (fillType === "empty") return null;

        return (
          <StarIcon key={starIndex} size={size} fillType={fillType} />
        );
      })}
    </div>
  );
}

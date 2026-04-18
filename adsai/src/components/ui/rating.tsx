"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD_COLOR = "#f5c518";

export interface RatingProps {
  /** Rating value (1-10 scale, 0 means no rating) */
  value: number;
  /** Callback when rating changes */
  onChange?: (value: number) => void;
  /** Size of each star in pixels */
  size?: number;
  /** Whether the rating is read-only */
  readOnly?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * * @param {RatingProps} props - The component's properties.
 *  * @param {number} props.value - The initial rating value.
 *  * @param {function} props.onChange - A callback function to update the rating value.
 *  * @param {number} [props.size=24] - The size of the stars (default: 24).
 *  * @param {boolean} [props.readOnly=false] - Whether the component is read-only (default: false).
 *  * @param {string} [props.className=""] - Additional CSS class names.
 *  
 *
 * export function Rating({
 *   value,
 *   onChange,
 *   size = 24,
 *   readOnly = false,
 *   className,
 * }: RatingProps) {
 *   // ... rest of your code ...
 * }
 */
export function Rating({
  value,
  onChange,
  size = 24,
  readOnly = false,
  className,
}: RatingProps) {
  const [rating, setRating] = React.useState(value);
  const [hoverRating, setHoverRating] = React.useState(0);

  // Sync internal state with external value
  React.useEffect(() => {
    setRating(value);
  }, [value]);

  // Always show hover preference if active, otherwise show saved rating
  const displayRating = hoverRating || rating;

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleStarHover = (starIndex: number, isLeftHalf: boolean) => {
    if (readOnly) return;
    // starIndex is 0-4 (5 stars)
    // Left half: (index * 2) + 1 = 1, 3, 5, 7, 9
    // Right half: (index * 2) + 2 = 2, 4, 6, 8, 10
    const newHoverRating = isLeftHalf
      ? starIndex * 2 + 1
      : starIndex * 2 + 2;
    setHoverRating(newHoverRating);
  };

  const handleStarClick = (starIndex: number, isLeftHalf: boolean) => {
    if (readOnly) return;
    const clickedValue = isLeftHalf
      ? starIndex * 2 + 1
      : starIndex * 2 + 2;

    // Toggle: if clicking the same value, remove rating (set to 0)
    const newRating = rating === clickedValue ? 0 : clickedValue;
    setRating(newRating);
    onChange?.(newRating);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    handleStarHover(starIndex, isLeftHalf);
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    handleStarClick(starIndex, isLeftHalf);
  };

  // Calculate fill percentage for each star (0%, 50%, or 100%)
  const getStarFillWidth = (starIndex: number): string => {
    // starIndex is 0-4
    // displayRating is 1-10
    // Star 0: fully filled at rating >= 2, half at rating >= 1
    // Star 1: fully filled at rating >= 4, half at rating >= 3
    // etc.
    const fullThreshold = (starIndex + 1) * 2; // 2, 4, 6, 8, 10
    const halfThreshold = starIndex * 2 + 1; // 1, 3, 5, 7, 9

    if (displayRating >= fullThreshold) {
      return "100%";
    } else if (displayRating >= halfThreshold) {
      return "50%";
    }
    return "0%";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5",
        !readOnly && "cursor-pointer",
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="relative"
          style={{ width: size, height: size }}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onClick={(e) => handleClick(e, index)}
        >
          {/* Base Gray Star */}
          <Star
            size={size}
            className="absolute inset-0 text-neutral-600"
            fill="currentColor"
            strokeWidth={0}
          />

          {/* Gold Star with dynamic width (overflow hidden) */}
          <div
            className="absolute inset-0 overflow-hidden transition-all duration-75"
            style={{ width: getStarFillWidth(index) }}
          >
            <Star
              size={size}
              style={{ color: GOLD_COLOR }}
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Rating;

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const starRatingVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      xs: "gap-0.5",
      sm: "gap-0.5",
      md: "gap-1",
      lg: "gap-1",
      xl: "gap-1",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const starSizeMap = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export interface StarRatingProps
  extends VariantProps<typeof starRatingVariants>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Rating value (0-5 scale, supports decimal values like 3.5) */
  value: number;
  /** Maximum rating (default: 5) */
  max?: number;
  /** Whether the rating is interactive */
  interactive?: boolean;
  /** Callback when rating changes (only for interactive mode). Pass null to remove rating. */
  onChange?: (value: number | null) => void;
  /** Whether to show the numeric value next to stars */
  showValue?: boolean;
  /** Color variant - 'gold' is recommended for cinematic feel */
  color?: "brand" | "yellow" | "neutral" | "gold";
}

/**
 * * @param {Object} props - Component properties
 *  * @param {number} props.value - The rating value (0-10)
 *  * @param {number} [props.max=5] - The maximum number of stars
 *  * @param {string} [props.size="sm"] - The size of the star rating (xs, sm, md, lg)
 *  * @param {boolean} [props.interactive=false] - Whether the rating is interactive
 *  * @param {function} [props.onChange] - Callback function for when a star is clicked or hovered over
 *  * @param {boolean} [props.showValue=false] - Whether to display the value next to the stars
 *  * @param {string} [props.color="brand"] - The color of the rating (brand, yellow, neutral, gold)
 *  * @param {string} [props.className] - Additional CSS class names for the component
 *  
 * export function StarRating({
 *   value,
 *   max = 5,
 *   size = "sm",
 *   interactive = false,
 *   onChange,
 *   showValue = false,
 *   color = "brand",
 *   className,
 *   ...props
 * }: StarRatingProps) {
 *   // ... rest of your code ...
 * }
 */
export function StarRating({
  value,
  max = 5,
  size = "sm",
  interactive = false,
  onChange,
  showValue = false,
  color = "brand",
  className,
  ...props
}: StarRatingProps) {
  // Normalize incoming value to the star scale (`max`). If the provided
  // value looks like a 0-10 score (common from TMDB), scale it to the
  // component's `max` (default 5). This keeps star visuals and numeric
  // display consistent.
  const normalizedValue = value > max && value <= 10 ? (value / 10) * max : value;
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? normalizedValue;
  const starSize = starSizeMap[size || "sm"];

  // Calculate fill percentage (0-100%)
  const fillPercentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

  // Cinematic gold: #F5C518 (IMDb-style amber/gold)
  const filledColorClasses = {
    brand: "text-brand-400",
    yellow: "text-yellow-400",
    neutral: "text-neutral-400",
    gold: "text-[#F5C518]",
  };

  const emptyColorClasses = {
    brand: "text-neutral-600",
    yellow: "text-neutral-600",
    neutral: "text-neutral-700",
    gold: "text-neutral-600",
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      // Toggle logic: compare against the normalized value so clicks align
      // with the visual star scale. If clicking the same rating, remove it.
      const current = Math.round(normalizedValue * 100) / 100;
      if (current === starIndex) {
        onChange(null);
      } else {
        onChange(starIndex);
      }
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverValue(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(null);
    }
  };

  // Calculate container width based on number of stars and gap
  const gapPx = size === "xs" || size === "sm" ? 2 : 4;
  const totalWidth = max * starSize + (max - 1) * gapPx;

  return (
    <div
      className={cn(starRatingVariants({ size }), className)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Cropped Container Pattern */}
      <div className="relative w-fit">
        {/* Layer 1 (Background): Grey Stars - rendered normally */}
        <div className={cn("flex", starRatingVariants({ size }))}>
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={`empty-${i}`}
              size={starSize}
              className={cn(
                emptyColorClasses[color],
                interactive && "cursor-pointer"
              )}
              fill="currentColor"
              onClick={() => handleClick(i + 1)}
              onMouseEnter={() => handleMouseEnter(i + 1)}
            />
          ))}
        </div>

        {/* Layer 2 (Foreground): Gold Stars - absolute positioned, cropped by width */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden z-10"
          style={{ width: `${fillPercentage}%` }}
        >
          {/* Inner container forced to full width so stars don't squish */}
          <div 
            className={cn("flex", starRatingVariants({ size }))} 
            style={{ minWidth: totalWidth }}
          >
            {Array.from({ length: max }, (_, i) => (
              <Star
                key={`filled-${i}`}
                size={starSize}
                className={cn(
                  filledColorClasses[color],
                  interactive && "cursor-pointer"
                )}
                fill="currentColor"
                onClick={() => handleClick(i + 1)}
                onMouseEnter={() => handleMouseEnter(i + 1)}
              />
            ))}
          </div>
        </div>

        {/* Interactive Click Zones (on top of everything) */}
        {interactive && (
          <div 
            className="absolute top-0 left-0 h-full flex z-20"
            style={{ width: totalWidth }}
          >
            {Array.from({ length: max }, (_, i) => (
              <div
                key={`zone-${i}`}
                className="cursor-pointer hover:scale-110 transition-transform"
                style={{ width: starSize + (i < max - 1 ? gapPx : 0), height: starSize }}
                onClick={() => handleClick(i + 1)}
                onMouseEnter={() => handleMouseEnter(i + 1)}
              />
            ))}
          </div>
        )}
      </div>

      {showValue && (
        <span className={cn("ml-2 text-sm font-bold relative top-[-2px]", filledColorClasses[color])}>
          {Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export { starRatingVariants };

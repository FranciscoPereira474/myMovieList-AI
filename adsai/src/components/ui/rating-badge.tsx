"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold backdrop-blur-md border border-white/10 shadow-sm",
  {
    variants: {
      color: {
        green: "bg-brand-600/90 text-white",
        yellow: "bg-yellow-600/90 text-white",
        red: "bg-red-600/90 text-white",
      },
      size: {
        sm: "text-[10px] px-1 py-0.5",
        md: "text-xs px-1.5 py-0.5",
        lg: "text-sm px-2 py-1",
      },
    },
    defaultVariants: {
      color: "green",
      size: "md",
    },
  }
);

function getColorFromScore(score: number): "green" | "yellow" | "red" {
  if (score >= 4.0) return "green";
  if (score >= 2.5) return "yellow";
  return "red";
}

export interface RatingBadgeProps
  extends Omit<VariantProps<typeof ratingBadgeVariants>, "color">,
    React.HTMLAttributes<HTMLDivElement> {
  /** Rating score (0-10 scale). Color is determined automatically. */
  score: number;
  /** Whether to show the star icon */
  showIcon?: boolean;
  /** Number of decimal places to display */
  decimals?: number;
}

/**
 * * Renders a rating badge component.
 *  *
 *  * @param {RatingBadgeProps} props - The properties of the rating badge.
 *  * @returns {JSX.Element} The rendered rating badge component.
 *  
 * export function RatingBadge({
 *   score,
 *   size,
 *   showIcon = true,
 *   decimals = 1,
 *   className,
 *   ...props
 * }: RatingBadgeProps) {
 *   const color = getColorFromScore(score);
 *   const displayScore = score.toFixed(decimals);
 *
 *   return (
 *     <div
 *       className={cn(ratingBadgeVariants({ color, size }), className)}
 *       {...props}
 *     >
 *       {showIcon && <Star className="h-2.5 w-2.5 fill-current" />}
 *       <span>{displayScore}</span>
 *     </div>
 *   );
 * }
 */
export function RatingBadge({
  score,
  size,
  showIcon = true,
  decimals = 1,
  className,
  ...props
}: RatingBadgeProps) {
  const color = getColorFromScore(score);
  const displayScore = score.toFixed(decimals);

  return (
    <div
      className={cn(ratingBadgeVariants({ color, size }), className)}
      {...props}
    >
      {showIcon && <Star className="h-2.5 w-2.5 fill-current" />}
      <span>{displayScore}</span>
    </div>
  );
}

export { ratingBadgeVariants };

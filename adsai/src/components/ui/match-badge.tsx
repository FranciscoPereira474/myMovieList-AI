"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const matchBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded border border-transparent shadow-md",
  {
    variants: {
      tier: {
        // Use a consistent translucent dark-gray background for all tiers
        // so the badge appearance does not change based on score.
        high: "bg-neutral-800/60 text-neutral-100",
        medium: "bg-neutral-800/60 text-neutral-100",
        low: "bg-neutral-800/60 text-neutral-100",
      },
      size: {
        xs: "text-[10px] px-1 py-0.5",
        sm: "text-xs px-2 py-1",
        md: "text-sm px-2.5 py-1.5",
      },
    },
    defaultVariants: {
      tier: "high",
      size: "sm",
    },
  }
);

function getTierFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
  return "low";
}

export interface MatchBadgeProps
  extends Omit<VariantProps<typeof matchBadgeVariants>, "tier">,
    React.HTMLAttributes<HTMLDivElement> {
  /** Match percentage (0-100) */
  score: number;
  /** Whether to show the percentage symbol */
  showPercentage?: boolean;
  /** Size variant */
  size?: "xs" | "sm" | "md";
}

/**
 * * Renders a badge indicating the user's match score.
 *  *
 *  * @param {number} score - The user's match score.
 *  * @param {boolean} [showPercentage=true] - Whether to display the percentage of matches.
 *  * @param {string} size - The size of the badge (e.g. "small", "medium", etc.).
 *  * @param {string} className - Additional CSS class names for the badge.
 *  * @param {...any} props - Additional HTML attributes.
 *  *
 *  * @returns {JSX.Element} The rendered badge element.
 */
export function MatchBadge({
  score,
  showPercentage = true,
  size,
  className,
  ...props
}: MatchBadgeProps) {
  const tier = getTierFromScore(score);
  const displayScore = Math.round(score);

  return (
    <div className={cn(matchBadgeVariants({ tier, size }), className)} {...props}>
      <span>
        {displayScore}
        {showPercentage && "%"} Match
      </span>
    </div>
  );
}

export { matchBadgeVariants };

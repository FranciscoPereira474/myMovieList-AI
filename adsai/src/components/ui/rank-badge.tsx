"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const rankBadgeVariants = cva(
  "absolute top-0 left-0 font-black px-3 py-1 rounded-br-lg shadow-lg z-10",
  {
    variants: {
      variant: {
        gold: "bg-white/90 backdrop-blur text-black",
        silver: "bg-neutral-800/90 backdrop-blur text-white",
        default: "bg-neutral-800/90 backdrop-blur text-white",
      },
      size: {
        sm: "text-sm px-2 py-0.5",
        md: "text-lg px-3 py-1",
        lg: "text-xl px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function getVariantFromRank(rank: number): "gold" | "silver" | "default" {
  if (rank === 1) return "gold";
  if (rank <= 3) return "silver";
  return "default";
}

export interface RankBadgeProps
  extends Omit<VariantProps<typeof rankBadgeVariants>, "variant">,
    React.HTMLAttributes<HTMLDivElement> {
  /** Rank number (1-indexed) */
  rank: number;
  /** Format prefix (default: "#") */
  prefix?: string;
}

/**
 * * Renders a rank badge with the specified rank and size.
 *  *
 *  * @param {string} rank - The rank to display on the badge (e.g. "1", "2", etc.)
 *  * @param {number} size - The size of the badge
 *  * @param {string} [prefix="#"] - The prefix to add before the rank (default: "#")
 *  * @param {string} [className] - Additional CSS class names for the badge
 *  * @returns {JSX.Element} The rendered rank badge element
 */
export function RankBadge({
  rank,
  size,
  prefix = "#",
  className,
  ...props
}: RankBadgeProps) {
  const variant = getVariantFromRank(rank);
  const displayRank = rank.toString().padStart(2, "0");

  return (
    <div
      className={cn(rankBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {prefix}{displayRank}
    </div>
  );
}

export { rankBadgeVariants };

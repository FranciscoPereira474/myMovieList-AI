"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RatingDistributionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rating counts for each star level (index 0 = 1 star, index 4 = 5 stars) */
  distribution: [number, number, number, number, number];
  /** Total number of ratings */
  totalRatings: number;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * * Renders a rating distribution chart.
 *  *
 *  * @param {RatingDistributionProps} props
 *  * @param {number[]} props.distribution - The distribution of ratings (e.g. [1, 2, 3])
 *  * @param {number} props.totalRatings - The total number of ratings
 *  * @param {boolean} [props.showLabels=true] - Whether to show labels on the chart
 *  * @param {string} [props.size="md"] - The size of the chart (e.g. "sm", "lg")
 *  * @param {string} [props.className] - Additional CSS class names for the chart container
 *  *
 *  * @returns {JSX.Element} The rating distribution chart component
 */
export function RatingDistribution({
  distribution,
  totalRatings,
  showLabels = true,
  size = "md",
  className,
  ...props
}: RatingDistributionProps) {
  // Calculate percentages
  const percentages = distribution.map((count) =>
    totalRatings > 0 ? (count / totalRatings) * 100 : 0
  );

  // Reverse to show 5 stars at top
  const reversedDistribution = [...distribution].reverse();
  const reversedPercentages = [...percentages].reverse();

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {reversedDistribution.map((_, index) => {
        const starNumber = 5 - index;
        const percentage = reversedPercentages[index];

        return (
          <div
            key={starNumber}
            className={cn(
              "flex items-center gap-2",
              size === "sm" ? "text-[10px]" : "text-xs"
            )}
          >
            {showLabels && (
              <span className="w-2 text-neutral-400">{starNumber}</span>
            )}
            <div
              className={cn(
                "flex-1 bg-neutral-800 rounded-full overflow-hidden",
                size === "sm" ? "h-1" : "h-1.5"
              )}
            >
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

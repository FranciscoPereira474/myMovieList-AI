"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
// rating range removed — slider not needed
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ReviewFilters as ReviewFiltersType } from "@/app/actions/reviews";

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: ReviewFiltersType) => void;
  idPrefix?: string;
  onApply?: (filters?: ReviewFiltersType) => void;
  className?: string;
  hideHeader?: boolean;
  hideSort?: boolean;
  hideFriendsOnly?: boolean;
}

/**
 * * @param {ReviewFiltersProps} props - The component's properties.
 *  * @param {Object} props.filters - The current filter settings.
 *  * @param {number} props.filters.ratingMin - The minimum rating for the filter.
 *  * @param {number} props.filters.ratingMax - The maximum rating for the filter.
 *  * @param {boolean} props.filters.hideSpoilers - Whether to hide spoilers in the filter.
 *  * @param {boolean} props.filters.friendsOnly - Whether to show only friends' reviews in the filter.
 *  * @param {boolean} props.filters.rewatchesOnly - Whether to show only rewatched reviews in the filter.
 *  
 * export function ReviewFilters({ filters, onFiltersChange }: ReviewFiltersProps) {
 *   const [ratingMin, setRatingMin] = useState(filters.ratingMin ?? 0);
 *   const [ratingMax, setRatingMax] = useState(filters.ratingMax ?? 5);
 *
 *   const handleSpoilerToggle = () => {
 *     onFiltersChange({ ...filters, hideSpoilers: !filters.hideSpoilers });
 *   };
 *
 *   const handleFriendsOnlyToggle = () => {
 *     onFiltersChange({ ...filters, friendsOnly: !filters.friendsOnly });
 *   };
 *
 *   const handleRewatchesOnlyToggle = () => {
 *     onFiltersChange({ ...filters, rewatchesOnly: !filters.rewatchesOnly });
 *   };
 *
 *   return (
 *     <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
 *       {/* ... }
 *     </aside>
 *   );
 * }
 */
export function ReviewFilters({
  filters,
  onFiltersChange,
  idPrefix = "reviews-filter",
  className,
  hideHeader,
  hideSort,
  onApply,
  hideFriendsOnly = false,
}: ReviewFiltersProps) {
  // rating range removed — keep only boolean flags

  // Keep a local copy of filters so changes don't apply until user clicks "Apply"
  const [localFilters, setLocalFilters] = React.useState<ReviewFiltersType>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const update = (patch: Partial<ReviewFiltersType>) =>
    setLocalFilters((prev) => ({ ...prev, ...patch }));

  const clearFilters = () => {
    setLocalFilters((prev) => ({
      ...prev,
      hideSpoilers: false,
      friendsOnly: false,
      ratingMin: undefined,
      ratingMax: undefined,
    }));
  };

  const hasActiveFilters = !!localFilters.hideSpoilers || !!localFilters.friendsOnly;

  // If a className is provided (used by mobile dialog), avoid sticky/top spacing
  const baseAsideClass = className
    ? "space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
    : "space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 hidden lg:block";

  // inner spacing inside the filters block — reduce when used in modal (className provided)
  // use slightly larger spacing on desktop between Sort and Filters sections
  const innerSpacingClass = className ? "space-y-2" : "space-y-5";

  return (
    <aside className={cn(baseAsideClass, className)}>
      <div className={innerSpacingClass}>
        {/* Sort By (now shown first) */}
        {!hideSort && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Sort By</h3>
            <Select
              value={localFilters.sortBy || "popular"}
              onValueChange={(value) => update({ sortBy: value as ReviewFiltersType["sortBy"] })}
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-white cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                <SelectItem value="popular" className="text-neutral-300 cursor-pointer">Popular</SelectItem>
                <SelectItem value="recent" className="text-neutral-300 cursor-pointer">Recent</SelectItem>
                <SelectItem value="most_liked" className="text-neutral-300 cursor-pointer">Most Liked</SelectItem>
                <SelectItem value="most_disliked" className="text-neutral-300 cursor-pointer">Most Disliked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filters header (moved below sort) + options in same spaced block */}
        <div className="space-y-2">
          {!hideHeader && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          <div className={className ? "space-y-1" : "space-y-2"}>
            <div className="flex items-center gap-4">
              <Checkbox
                id={`${idPrefix}-hide-spoilers`}
                checked={!!localFilters.hideSpoilers}
                onCheckedChange={(checked) => update({ hideSpoilers: !!checked })}
                className="border-neutral-600 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
              />
              <Label htmlFor={`${idPrefix}-hide-spoilers`} className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                Hide Spoilers
              </Label>
            </div>

            {!hideFriendsOnly && (
              <div className="flex items-center gap-4">
                <Checkbox
                  id={`${idPrefix}-friends-only`}
                  checked={!!localFilters.friendsOnly}
                  onCheckedChange={(checked) => update({ friendsOnly: !!checked })}
                  className="border-neutral-600 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                />
                <Label htmlFor={`${idPrefix}-friends-only`} className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  Following Only
                </Label>
              </div>
            )}

            {/* rewatches option removed */}
          </div>
        </div>

        <hr className={cn("border-neutral-800", className ? "mt-5" : "mt-3")} />

        {className ? (
          <div className="py-5">
            <Button
              onClick={() => {
                if (typeof onApply === "function") {
                  onApply(localFilters);
                } else {
                  onFiltersChange(localFilters);
                }
              }}
              className="w-full bg-white text-black font-bold hover:bg-neutral-200 shadow-lg shadow-white/5 cursor-pointer"
            >
              Apply Filters
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              if (typeof onApply === "function") {
                onApply(localFilters);
              } else {
                onFiltersChange(localFilters);
              }
            }}
            className="w-full bg-white text-black font-bold hover:bg-neutral-200 shadow-lg shadow-white/5 cursor-pointer"
          >
            Apply Filters
          </Button>
        )}
      </div>
    </aside>
  );
}

"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewFilters } from "./ReviewFilters";
import type { ReviewFilters as ReviewFiltersType } from "@/app/actions/reviews";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface MobileFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: ReviewFiltersType) => void;
  idPrefix?: string;
  hideFriendsOnly?: boolean;
}

export function MobileFilters({ filters, onFiltersChange, idPrefix = "mobile", hideFriendsOnly = false }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<ReviewFiltersType>(filters);

  React.useEffect(() => {
    // When opening the dialog, initialize localFilters from current props
    if (isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  return (
    <div className="lg:hidden mb-6">
      <div className="flex gap-6">
        <div className="w-1/2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-neutral-900 border-neutral-800 text-white py-3 flex items-center justify-center gap-2 cursor-pointer">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-h-[90vh] max-w-full sm:max-w-lg overflow-y-auto bg-neutral-950 border-neutral-800 p-0">
              <DialogHeader className="px-6 py-4 border-b border-neutral-800">
                <DialogTitle className="text-white">Filters</DialogTitle>
              </DialogHeader>
              <div className="px-6 pt-0 pb-4">
                  <ReviewFilters
                    filters={localFilters}
                    onFiltersChange={(f) => setLocalFilters(f)}
                    idPrefix={idPrefix}
                    onApply={(f) => {
                      // Prefer filters provided by the child; fall back to localFilters
                      const applied = f ?? localFilters;
                      onFiltersChange(applied);
                      setIsOpen(false);
                    }}
                    className="block space-y-4"
                    hideHeader
                    hideSort
                    hideFriendsOnly={hideFriendsOnly}
                  />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-1/2">
          {/* Sorting is applied immediately (outside the modal) so it shouldn't be reset when opening the dialog */}
          <Select value={filters.sortBy || "popular"} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as ReviewFiltersType["sortBy"] })}>
            <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white py-3 cursor-pointer">
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
      </div>
    </div>
  );
}

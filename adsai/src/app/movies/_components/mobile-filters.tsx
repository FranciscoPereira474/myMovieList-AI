"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoviesFilterSidebar } from "./movies-filter-sidebar";
import type { Genre, SortOption } from "../_lib/queries";

interface MobileFiltersProps {
  onOpenFilters?: () => void;
  /** Base path to use when updating the URL (defaults to /movies) */
  basePath?: string;
  genres: Genre[];
  yearRange: { min: number; max: number };
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "rating.desc", label: "Top Rated" },
  { value: "title.asc", label: "Title A–Z" },
  { value: "title.desc", label: "Title Z–A" },
  { value: "release_date.desc", label: "Newest" },
  { value: "release_date.asc", label: "Oldest" },
];

  /**
 * * MobileFilters component
 *  *
 *  * @param {MobileFiltersProps} props - Component properties
 *  * @returns {JSX.Element} MobileFilters JSX element
 *  
 * export function MobileFilters({ basePath = "/movies", genres, yearRange }: MobileFiltersProps) {
 *   // ... rest of the code ...
 * }
 */
export function MobileFilters({ basePath = "/movies", genres, yearRange }: MobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const currentSort = (searchParams.get("sortBy") as SortOption) || "popularity.desc";

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "popularity.desc") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    params.delete("page"); // Reset to page 1
    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="lg:hidden mb-6 flex gap-3">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 bg-neutral-900 border-neutral-800 text-white py-3 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-h-[90vh] max-w-full sm:max-w-lg overflow-y-auto bg-neutral-950 border-neutral-800 p-0">
          <DialogHeader className="px-6 py-4 border-b border-neutral-800">
            <DialogTitle className="text-white">Filters</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <MoviesFilterSidebar 
              genres={genres} 
              yearRange={yearRange} 
              className="block" 
              onApply={() => setIsOpen(false)}
              idPrefix="mobile"
              hideSort
              hideHeader
            />
          </div>
        </DialogContent>
      </Dialog>
      <Select value={currentSort} onValueChange={(value) => handleSortChange(value as SortOption)}>
        <SelectTrigger className="flex-1 bg-neutral-900 border-neutral-800 text-white py-3 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-800">
          {SORT_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-neutral-300 focus:bg-neutral-800 focus:text-white cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

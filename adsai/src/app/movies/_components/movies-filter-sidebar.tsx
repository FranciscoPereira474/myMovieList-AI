"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Genre, SortOption } from "../_lib/queries";

interface MoviesFilterSidebarProps {
  genres: Genre[];
  yearRange: { min: number; max: number };
  className?: string;
  /** Base path to use when updating the URL (defaults to /movies) */
  basePath?: string;
  onApply?: () => void;
  idPrefix?: string;
  hideSort?: boolean;
  hideHeader?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity.desc", label: "Popularity Descending" },
  { value: "rating.desc", label: "Highest Rated" },
  { value: "title.asc", label: "Title A–Z" },
  { value: "title.desc", label: "Title Z–A" },
  { value: "release_date.desc", label: "Release Date Descending" },
  { value: "release_date.asc", label: "Release Date Ascending" },
];

/**
 * * @param {MoviesFilterSidebarProps} props - Props for the MoviesFilterSidebar component.
 *  * @returns {JSX.Element} The JSX element representing the sidebar filters.
 *  
 * export function MoviesFilterSidebar({
 *   genres,
 *   yearRange: dbYearRange,
 *   className,
 *   basePath = "/movies",
 *   onApply,
 *   idPrefix = "filter",
 * }: MoviesFilterSidebarProps) {
 *   const router = useRouter();
 *   const searchParams = useSearchParams();
 *
 *   // Use dynamic year range from database
 *   const MIN_YEAR = dbYearRange.min;
 *   const MAX_YEAR = dbYearRange.max;
 *
 *   // Parse current filter state from URL
 *   const currentSort = (searchParams.get("sortBy") as SortOption) || "popularity.desc";
 *   const currentGenresParam = searchParams.get("genres") || "";
 *   const currentYearMinParam = searchParams.get("yearMin") || "";
 *   const currentYearMaxParam = searchParams.get("yearMax") || "";
 *
 *   // Local state for filters
 *   const [selectedGenres, setSelectedGenres] = React.useState<number[]>(() => 
 *     currentGenresParam ? currentGenresParam.split(",").map(Number).filter(Boolean) : []
 *   );
 *   const [sortBy, setSortBy] = React.useState<SortOption>(currentSort);
 *   const [yearRange, setYearRange] = React.useState<[number, number]>(() => [
 *     currentYearMinParam ? Number(currentYearMinParam) : MIN_YEAR,
 *     currentYearMaxParam ? Number(currentYearMaxParam) : MAX_YEAR,
 *   ]);
 *
 *   // Sync local state with URL changes (using primitive values to avoid infinite loops)
 *   React.useEffect(() => {
 *     const genres = currentGenresParam ? currentGenresParam.split(",").map(Number).filter(Boolean) : [];
 *     const yearMin = currentYearMinParam ? Number(currentYearMinParam) : MIN_YEAR;
 *     const yearMax = currentYearMaxParam ? Number(currentYearMaxParam) : MAX_YEAR;
 *     
 *     setSelectedGenres(genres);
 *     setSortBy(currentSort);
 *     setYearRange([yearMin, yearMax]);
 *   }, [currentGenresParam, currentYearMinParam, currentYearMaxParam, currentSort, MIN_YEAR, MAX_YEAR]);
 *
 *   const handleGenreToggle = (genreId: number, checked: boolean) => {
 *     setSelectedGenres((prev) =>
 *       checked ? [...prev, genreId] : prev.filter((id) => id !== genreId)
 *     );
 *   };
 *
 *   const applyFilters = () => {
 *     const params = new URLSearchParams();
 *
 *     if (sortBy !== "popularity.desc") {
 *       params.set("sortBy", sortBy);
 *     }
 *
 *     if (selectedGenres.length > 0) {
 *       params.set("genres", selectedGenres.join(","));
 *     }
 *
 *     if (yearRange[0] > MIN_YEAR) {
 *       params.set("yearMin", yearRange[0].toString());
 *     }
 *
 *     if (yearRange[1] < MAX_YEAR) {
 *       params.set("yearMax", yearRange[1].toString());
 *     }
 *
 *     // Reset to page 1 when filters change
 *     const queryString = params.toString();
 *     router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
 *     
 *     if (onApply) {
 *       onApply();
 *     }
 *   };
 *
 *   const clearFilters = () => {
 *     setSelectedGenres([]);
 *     setSortBy("popularity.desc");
 *     setYearRange([MIN_YEAR, MAX_YEAR]);
 *     router.push(basePath);
 *   };
 *
 *   const hasActiveFilters =
 *     selectedGenres.length > 0 ||
 *     sortBy !== "popularity.desc" ||
 *     yearRange[0] > MIN_YEAR ||
 *     yearRange[1] < MAX_YEAR;
 *
 *   return (
 *     // JSX element representing the sidebar filters
 *   );
 * }
 */
export function MoviesFilterSidebar({
  genres,
  yearRange: dbYearRange,
  className,
  basePath = "/movies",
  onApply,
  idPrefix = "filter",
  hideSort = false,
  hideHeader = false,
}: MoviesFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use dynamic year range from database
  const MIN_YEAR = dbYearRange.min;
  const MAX_YEAR = dbYearRange.max;

  // Parse current filter state from URL
  const currentSort = (searchParams.get("sortBy") as SortOption) || "popularity.desc";
  const currentGenresParam = searchParams.get("genres") || "";
  const currentYearMinParam = searchParams.get("yearMin") || "";
  const currentYearMaxParam = searchParams.get("yearMax") || "";

  // Local state for filters
  const [selectedGenres, setSelectedGenres] = React.useState<number[]>(() => 
    currentGenresParam ? currentGenresParam.split(",").map(Number).filter(Boolean) : []
  );
  const [sortBy, setSortBy] = React.useState<SortOption>(currentSort);
  const [yearRange, setYearRange] = React.useState<[number, number]>(() => [
    currentYearMinParam ? Number(currentYearMinParam) : MIN_YEAR,
    currentYearMaxParam ? Number(currentYearMaxParam) : MAX_YEAR,
  ]);

  // Sync local state with URL changes (using primitive values to avoid infinite loops)
  React.useEffect(() => {
    const genres = currentGenresParam ? currentGenresParam.split(",").map(Number).filter(Boolean) : [];
    const yearMin = currentYearMinParam ? Number(currentYearMinParam) : MIN_YEAR;
    const yearMax = currentYearMaxParam ? Number(currentYearMaxParam) : MAX_YEAR;
    
    setSelectedGenres(genres);
    setSortBy(currentSort);
    setYearRange([yearMin, yearMax]);
  }, [currentGenresParam, currentYearMinParam, currentYearMaxParam, currentSort, MIN_YEAR, MAX_YEAR]);

  const handleGenreToggle = (genreId: number, checked: boolean) => {
    setSelectedGenres((prev) =>
      checked ? [...prev, genreId] : prev.filter((id) => id !== genreId)
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (sortBy !== "popularity.desc") {
      params.set("sortBy", sortBy);
    }

    if (selectedGenres.length > 0) {
      params.set("genres", selectedGenres.join(","));
    }

    if (yearRange[0] > MIN_YEAR) {
      params.set("yearMin", yearRange[0].toString());
    }

    if (yearRange[1] < MAX_YEAR) {
      params.set("yearMax", yearRange[1].toString());
    }

    // Reset to page 1 when filters change
    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
    
    if (onApply) {
      onApply();
    }
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSortBy("popularity.desc");
    setYearRange([MIN_YEAR, MAX_YEAR]);
    router.push(basePath);
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    sortBy !== "popularity.desc" ||
    yearRange[0] > MIN_YEAR ||
    yearRange[1] < MAX_YEAR;

  return (
    <aside
      className={cn(
        "space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2",
        className
      )}
    >
      {/* Sort By */}
      {!hideSort && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-lg">Sort By</h3>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-white cursor-pointer">
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
      )}

      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Genres */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
            Genres
          </h3>
          <span className="text-[10px] text-neutral-500 uppercase">
            Scroll for more
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {genres.map((genre) => (
            <div key={genre.id} className="flex items-center gap-3">
              <Checkbox
                id={`${idPrefix}-genre-${genre.id}`}
                checked={selectedGenres.includes(genre.id)}
                onCheckedChange={(checked) =>
                  handleGenreToggle(genre.id, checked as boolean)
                }
                className="border-neutral-600 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
              />
              <Label
                htmlFor={`${idPrefix}-genre-${genre.id}`}
                className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer flex-1 py-1"
              >
                {genre.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* Release Year */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
          Release Year
        </h3>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              value={yearRange[0]}
              onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
              min={MIN_YEAR}
              max={yearRange[1]}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm py-2 px-3 rounded text-center focus:ring-1 focus:ring-brand-500 focus:outline-none focus:border-neutral-600 hover:border-neutral-700 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-0 top-0 bottom-0 flex items-center pr-2 pointer-events-none text-neutral-600 text-[10px]">
              MIN
            </span>
          </div>
          <span className="text-neutral-600">-</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
              min={yearRange[0]}
              max={MAX_YEAR}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm py-2 px-3 rounded text-center focus:ring-1 focus:ring-brand-500 focus:outline-none focus:border-neutral-600 hover:border-neutral-700 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-0 top-0 bottom-0 flex items-center pr-2 pointer-events-none text-neutral-600 text-[10px]">
              MAX
            </span>
          </div>
        </div>

        <Slider
          value={yearRange}
          onValueChange={(value) => setYearRange(value as [number, number])}
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={1}
          className="px-1 **:data-[slot=slider-track]:bg-neutral-800 **:data-[slot=slider-range]:bg-brand-500 **:data-[slot=slider-thumb]:border-brand-500"
        />
      </div>

      <hr className="border-neutral-800" />

      {/* Apply Button */}
      <Button
        onClick={applyFilters}
        className="w-full bg-white text-black font-bold hover:bg-neutral-200 shadow-lg shadow-white/5 cursor-pointer"
      >
        Apply Filters
      </Button>
    </aside>
  );
}

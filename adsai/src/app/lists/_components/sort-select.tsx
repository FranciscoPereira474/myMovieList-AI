"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTransition } from "react";
import type { ListSortOption } from "../_lib/queries";

const SORT_OPTIONS: { value: ListSortOption; label: string }[] = [
  { value: "popular_week", label: "Most Popular (Week)" },
  { value: "newest", label: "Newest Created" },
  { value: "most_saved", label: "Most Saved" },
];

interface SortSelectProps {
  currentSort: ListSortOption;
}

/**
 * * SortSelect component.
 *  *
 *  * @param {SortSelectProps} props - Component properties.
 *  * @returns {JSX.Element} The rendered component.
 *  
 * export function SortSelect({ currentSort }: SortSelectProps) {
 *   const router = useRouter();
 *   const searchParams = useSearchParams();
 *   const [isPending, startTransition] = useTransition();
 *
 *   
 *    * Handles changes to the sort select dropdown.
 *    *
 *    * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event.
 *    
 *   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
 *     const newSort = e.target.value as ListSortOption;
 *     const params = new URLSearchParams(searchParams.toString());
 *     params.set("sort", newSort);
 *     startTransition(() => {
 *       router.push(`/lists?${params.toString()}`);
 *     });
 *   };
 *
 *   return (
 *     <div className="flex items-center gap-3">
 *       <span className="text-xs text-neutral-500 hidden [@media(min-width:460px)]:inline">Sort by:</span>
 *       <div className="relative">
 *         <select
 *           value={currentSort}
 *           onChange={handleChange}
 *           className="appearance-none bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
 *         >
 *           {SORT_OPTIONS.map((option) => (
 *             <option key={option.value} value={option.value}>
 *               {option.label}
 *             </option>
 *           ))}
 *         </select>
 *         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
 *           {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown size={14} />}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 */
export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as ListSortOption;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    startTransition(() => {
      router.push(`/lists?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 hidden [@media(min-width:460px)]:inline">Sort by:</span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={handleChange}
          className="appearance-none bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown size={14} />}
        </div>
      </div>
    </div>
  );
}

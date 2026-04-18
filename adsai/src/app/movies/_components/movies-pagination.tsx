"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoviesPaginationProps {
  totalCount: number;
  itemsPerPage: number;
  /** Base path to use when updating the URL (defaults to /movies) */
  basePath?: string;
}

/**
 * * Displays a pagination component for movies.
 *  *
 *  * @param {MoviesPaginationProps} props - The properties to be passed to the component.
 *  * @returns {JSX.Element|null} The JSX element representing the pagination component, or null if there is only one page of data.
 *  
 * export function MoviesPagination({
 *   totalCount,
 *   itemsPerPage,
 *   basePath = "/movies",
 * }: MoviesPaginationProps) {
 *   const router = useRouter();
 *   const searchParams = useSearchParams();
 *   const currentPage = Number(searchParams.get("page")) || 1;
 *   const totalPages = Math.ceil(totalCount / itemsPerPage);
 *
 *   if (totalPages <= 1) return null;
 *
 *   const goToPage = (page: number) => {
 *     const params = new URLSearchParams(searchParams.toString());
 *     if (page === 1) {
 *       params.delete("page");
 *     } else {
 *       params.set("page", page.toString());
 *     }
 *     const queryString = params.toString();
 *     router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
 *   };
 *
 *   
 *    * Calculates the visible pages for pagination.
 *    *
 *    * @returns {(number | "ellipsis")[]} The array of visible pages, including ellipses.
 *    
 *   const getVisiblePages = (): (number | "ellipsis")[] => {
 *     const pages: (number | "ellipsis")[] = [];
 *     const showEllipsisThreshold = 7;
 *
 *     if (totalPages <= showEllipsisThreshold) {
 *       // Show all pages
 *       for (let i = 1; i <= totalPages; i++) {
 *         pages.push(i);
 *       }
 *     } else {
 *       // Always show first page
 *       pages.push(1);
 *
 *       if (currentPage > 3) {
 *         pages.push("ellipsis");
 *       }
 *
 *       // Show pages around current
 *       const start = Math.max(2, currentPage - 1);
 *       const end = Math.min(totalPages - 1, currentPage + 1);
 *
 *       for (let i = start; i <= end; i++) {
 *         pages.push(i);
 *       }
 *
 *       if (currentPage < totalPages - 2) {
 *         pages.push("ellipsis");
 *       }
 *
 *       // Always show last page
 *       pages.push(totalPages);
 *     }
 *
 *     return pages;
 *   };
 *
 *   const visiblePages = getVisiblePages();
 *
 *   return (
 *     <nav className="flex items-center gap-2">
 *       {/* Previous Button }
 *       <button
 *         onClick={() => goToPage(currentPage - 1)}
 *         disabled={currentPage === 1}
 *         className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 *       >
 *         <ChevronLeft className="h-4 w-4" />
 *       </button>
 *
 *       {/* Page Numbers }
 *       {visiblePages.map((page, index) =>
 *         page === "ellipsis" ? (
 *           <span key={`ellipsis-${index}`} className="px-2 text-neutral-600">
 *             ...
 *           </span>
 *         ) : (
 *           <button
 *             key={page}
 *             onClick={() => goToPage(page)}
 *             className={cn(
 *               "w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors",
 *               currentPage === page
 *                 ? "bg-brand-600 text-white border border-brand-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
 *                 : "border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
 *             )}
 *           >
 *             {page}
 *           </button>
 *         )
 *       )}
 *
 *       {/* Next Button }
 *       <button
 *         onClick={() => goToPage(currentPage + 1)}
 *         disabled={currentPage === totalPages}
 *         className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 *       >
 *         <ChevronRight className="h-4 w-4" />
 *       </button>
 *     </nav>
 *   );
 * }
 */
export function MoviesPagination({
  totalCount,
  itemsPerPage,
  basePath = "/movies",
}: MoviesPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
  };

  // Calculate visible page numbers
  const getVisiblePages = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-neutral-600">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer",
              currentPage === page
                ? "bg-brand-600 text-white border border-brand-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                : "border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

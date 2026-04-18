import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
}

/**
 * Pagination Component
 * Displays page navigation controls with previous/next buttons
 * and numbered page links. Updates URL with page parameter.
 */
export function Pagination({ currentPage, totalPages, query }: PaginationProps) {
  // Build base URL with search query if exists
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page > 1) params.set("page", page.toString());
    return `/users${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // Calculate visible page numbers (show max 7 pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      {hasPrevious ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed">
          <ChevronLeft className="h-5 w-5" />
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex items-center justify-center w-10 h-10 text-neutral-600"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? "bg-brand-600 text-black border-2 border-brand-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                  : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-600"
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {hasNext ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed">
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </nav>
  );
}

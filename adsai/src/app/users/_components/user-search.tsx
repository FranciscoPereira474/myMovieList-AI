"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface UserSearchProps {
  initialQuery: string;
}

/**
 * User Search Input - Client Component
 * Handles debounced search input with URL state management.
 * Updates the URL query parameter after user stops typing.
 */
export function UserSearch({ initialQuery }: UserSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(initialQuery);

  // Debounce search: update URL after 500ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      // Only update if the query has actually changed
      const currentQuery = params.get("q") || "";
      const newQuery = inputValue.trim();
      
      if (currentQuery === newQuery) {
        return; // No change, don't update
      }

      if (newQuery) {
        params.set("q", newQuery);
        params.delete("page"); // Reset to page 1 on new search
      } else {
        params.delete("q");
        params.delete("page");
      }

      // Use startTransition to prevent input lag during navigation
      startTransition(() => {
        router.replace(`/users?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, router, searchParams]);

  return (
    <div className="relative max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-500" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search members..."
        className="block w-full pl-10 pr-3 py-2.5 border border-neutral-800 rounded-lg bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

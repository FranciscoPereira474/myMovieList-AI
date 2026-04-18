"use client";

import { ListPreviewCard } from "@/components/ui/list-preview-card";
import { LoadMoreButton } from "@/components/ui/load-more-button";
import { useState, useTransition, useEffect } from "react";
import type { ListWithDetails, ListSortOption } from "../_lib/queries";

interface ListsGridProps {
  initialLists: ListWithDetails[];
  initialHasMore: boolean;
  sort: ListSortOption;
}

/**
 * * Renders a grid of lists with the ability to load more.
 *  *
 *  * @param {ListsGridProps} props - The properties passed to the component.
 *  * @returns {JSX.Element} The JSX element representing the grid of lists.
 *  
 * export function ListsGrid({ initialLists, initialHasMore, sort }: ListsGridProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function ListsGrid({ initialLists, initialHasMore, sort }: ListsGridProps) {
  const [lists, setLists] = useState(initialLists);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  // Keep client state in sync when parent provides new initial lists or sort changes.
  useEffect(() => {
    startTransition(() => {
      setLists(initialLists);
      setHasMore(initialHasMore);
    });
  }, [initialLists, initialHasMore, sort, startTransition]);

  const handleLoadMore = () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        offset: lists.length.toString(),
        sort,
      });

      const response = await fetch(`/lists/api?${params}`);
      if (!response.ok) return;

      const data = await response.json();
      setLists((prev) => [...prev, ...data.lists]);
      setHasMore(data.hasMore);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {lists.map((list) => (
          <ListPreviewCard
            key={list.id}
            list={{
              id: list.id,
              title: list.name,
              itemCount: list.item_count,
              saveCount: list.save_count,
              savedByMe: list.saved_by_me,
              isPublic: list.is_public,
            }}
            author={{
              name: list.user.username,
              username: list.user.username,
              avatarUrl: list.user.avatar_url ?? undefined,
            }}
            posterUrls={list.movie_posters}
            posterLinkToList={true}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12">
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={isPending}
            text="Load More Lists"
            loadingText="Loading..."
          />
        </div>
      )}
    </>
  );
}

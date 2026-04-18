"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import styles from "./user-lists-tabs.module.css";
import { ListPreviewCard } from "@/components/ui/list-preview-card";
import { LoadMoreButton } from "@/components/ui/load-more-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useState, useTransition } from "react";
import type { ListWithDetails } from "../../_lib/queries";
import { BookMarked, ListPlus, Plus } from "lucide-react";

import Link from "next/link";

interface UserListsTabsProps {
  username: string;
  userId: string;
  isCurrentUser?: boolean;
  initialCreatedLists: ListWithDetails[];
  initialSavedLists: ListWithDetails[];
  initialCreatedHasMore: boolean;
  initialSavedHasMore: boolean;
}

/**
 * * Renders a user's list tabs with created and saved lists.
 *  *
 *  * @param {UserListsTabsProps} props - The component props.
 *  * @returns {JSX.Element} The rendered component.
 *  
 * export function UserListsTabs({
 *   username,
 *   userId,
 *   isCurrentUser,
 *   initialCreatedLists,
 *   initialSavedLists,
 *   initialCreatedHasMore,
 *   initialSavedHasMore,
 * }: UserListsTabsProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function UserListsTabs({
  username,
  userId,
  isCurrentUser,
  initialCreatedLists,
  initialSavedLists,
  initialCreatedHasMore,
  initialSavedHasMore,
}: UserListsTabsProps) {
  const [createdLists, setCreatedLists] = useState(initialCreatedLists);
  const [savedLists, setSavedLists] = useState(initialSavedLists);
  const effectiveSavedLists = savedLists.map((l) => ({ ...l, saved_by_me: !!isCurrentUser }));
  const [createdHasMore, setCreatedHasMore] = useState(initialCreatedHasMore);
  const [savedHasMore, setSavedHasMore] = useState(initialSavedHasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMoreCreated = () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        type: "created",
        offset: createdLists.length.toString(),
      });

      const response = await fetch(`/lists/${userId}/api?${params}`);
      if (!response.ok) return;

      const data = await response.json();
      setCreatedLists((prev) => [...prev, ...data.lists]);
      setCreatedHasMore(data.hasMore);
    });
  };

  const handleLoadMoreSaved = () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        type: "saved",
        offset: savedLists.length.toString(),
      });

      const response = await fetch(`/lists/${userId}/api?${params}`);
      if (!response.ok) return;

      const data = await response.json();
      setSavedLists((prev) => [...prev, ...data.lists]);
      setSavedHasMore(data.hasMore);
    });
  };

  return (
    <Tabs defaultValue="created" className="w-full">
      <div className={`mb-8 flex flex-col-reverse sm:flex-row sm:items-center ${styles.root}`}>
        <TabsList className={`bg-neutral-900 border border-neutral-800 w-full sm:w-auto ${styles.tabsList}`}>
          <TabsTrigger
            value="created"
            className="data-[state=active]:bg-brand-500 data-[state=active]:text-black px-6 cursor-pointer"
          >
            <ListPlus className="w-4 h-4 mr-2" />
            Created ({createdLists.length})
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="data-[state=active]:bg-brand-500 data-[state=active]:text-black px-6 cursor-pointer"
          >
            <BookMarked className="w-4 h-4 mr-2" />
            Saved ({savedLists.length})
          </TabsTrigger>
        </TabsList>

        {isCurrentUser && (
          <div className={`w-full sm:w-auto flex justify-center sm:justify-end mb-4 sm:mb-0 sm:ml-4 ${styles.createWrapper}`}>
            <Link
              href="/list/new"
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Plus size={16} />
              Create List
            </Link>
          </div>
        )}
      </div>

      <TabsContent value="created">
        {createdLists.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdLists.map((list) => (
                <ListPreviewCard
                  key={list.id}
                  list={{
                    id: list.id,
                    title: list.name,
                    itemCount: list.item_count,
                    saveCount: list.save_count,
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

            {createdHasMore && (
              <div className="mt-12">
                <LoadMoreButton
                  onClick={handleLoadMoreCreated}
                  isLoading={isPending}
                  text="Load More Lists"
                  loadingText="Loading..."
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<ListPlus size={32} />}
            action={
              isCurrentUser
                ? { label: "Create List", href: "/list/new" }
                : undefined
            }
            title="No lists created yet"
            description={`${username} hasn't created any public lists yet.`}
          />
        )}
      </TabsContent>

      <TabsContent value="saved">
        {savedLists.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {effectiveSavedLists.map((list) => (
                <ListPreviewCard
                  key={list.id}
                  list={{
                    id: list.id,
                    title: list.name,
                    itemCount: list.item_count,
                    saveCount: list.save_count,
                    savedByMe: !!list.saved_by_me,
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

            {savedHasMore && (
              <div className="mt-12">
                <LoadMoreButton
                  onClick={handleLoadMoreSaved}
                  isLoading={isPending}
                  text="Load More Lists"
                  loadingText="Loading..."
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<BookMarked size={32} />}
            title="No saved lists"
            description={`${username} hasn't saved any lists yet.`}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { ListEditor } from "../../_components/list-editor";

interface Movie {
  id: string;
  title: string;
  release_date: string;
  poster_url: string;
}

interface ListItem {
  movie_id: string;
  movie: Movie;
}

interface ListData {
  name: string;
  description: string;
  is_public: boolean;
  items: ListItem[];
}

/**
 * * Edits the specified list page.
 *  *
 *  * @param {string} listId - The ID of the list to edit.
 *  * @returns {JSX.Element | null}
 *  
 * export default function EditListPage() {
 *   const router = useRouter();
 *   const params = useParams();
 *   const listId = params?.id as string;
 *
 *   // ... rest of the code remains the same ...
 */
export default function EditListPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [listData, setListData] = useState<ListData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      if (!listId) {
        setError("Invalid list ID");
        setIsLoading(false);
        return;
      }

      const supabase = createBrowserClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/login?redirect=/list/${listId}/edit`);
          return;
        }

        const { data: list, error: listError } = await supabase
          .from("lists")
          .select("id, name, description, is_public, user_id")
          .eq("id", listId)
          .single();

        if (listError || !list) {
          setError("List not found");
          setIsLoading(false);
          return;
        }

        if (list.user_id !== user.id) {
          setError("You do not have permission to edit this list");
          setIsLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("list_items")
          .select(
            `
            movie_id,
            movies (
              id,
              slug,
              title,
              release_date,
              poster_url
            )
          `
          )
          .eq("list_id", listId);

        if (itemsError) {
          console.error("Error fetching list items:", itemsError);
        }

        const transformedItems: ListItem[] = (items || []).map(
          (item: { movie_id: string; movies: unknown }) => ({
            movie_id: item.movie_id,
            movie: item.movies as Movie,
          })
        );

        setListData({
          name: list.name,
          description: list.description || "",
          is_public: list.is_public ?? true,
          items: transformedItems,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching list:", err);
        setError("Failed to load list");
        setIsLoading(false);
      }
    };

    fetchList();
  }, [listId, router]);

  if (isLoading) {
    return (
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-neutral-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-semibold text-black bg-brand-500 hover:bg-brand-400 transition-all"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!listData) {
    return null;
  }

  return (
    <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <ListEditor listId={listId} initialData={listData} />
    </main>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  X,
  GripVertical,
  Lock,
  Unlock,
  Save,
  Film,
} from "lucide-react";
import { createList, updateList } from "@/app/actions/lists";

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

interface ListEditorProps {
  listId?: string;
  initialData?: {
    name: string;
    description: string;
    is_public: boolean;
    items: ListItem[];
  };
  // optional redirect URL to return to after save/cancel
  redirect?: string;
  // optional movie id to pre-add to the new list
  initialMovieId?: string;
}

/**
 * * @param {ListEditorProps} props
 *  * @returns {JSX.Element}
 *  
 * export function ListEditor({ listId, initialData, redirect, initialMovieId }: ListEditorProps) {
 *   // ... rest of the code ...
 * }
 */
export function ListEditor({ listId, initialData, redirect, initialMovieId }: ListEditorProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [listItems, setListItems] = useState<ListItem[]>(
    initialData?.items || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Search movies
  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("id, title, release_date, poster_url")
          .ilike("title", `%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        const filteredResults = (data || []).filter(
          (movie) => !listItems.some((item) => item.movie_id === movie.id)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Error searching movies:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, listItems, supabase]);

  // Ref and handler to close the search dropdown when clicking outside
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // perform an immediate search (used when focusing the input)
  const performSearchImmediate = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, release_date, poster_url")
        .ilike("title", `%${query}%`)
        .limit(10);

      if (error) throw error;

      const filteredResults = (data || []).filter(
        (movie) => !listItems.some((item) => item.movie_id === movie.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching movies:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const addMovie = (movie: Movie) => {
    setListItems((prev) => {
      if (prev.some((it) => it.movie_id === movie.id)) return prev;
      return [...prev, { movie_id: movie.id, movie }];
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // If an initial movie id was provided via query params, fetch and add it once
  useEffect(() => {
    const loadInitialMovie = async () => {
      if (!initialMovieId) return;
      if (listItems.some((it) => it.movie_id === initialMovieId)) return;

      try {
        const { data, error } = await supabase
          .from("movies")
          .select("id, title, release_date, poster_url")
          .eq("id", initialMovieId)
          .single();

        if (!error && data) {
          addMovie({
            id: data.id,
            title: data.title,
            release_date: data.release_date,
            poster_url: data.poster_url,
          });
        }
      } catch (err) {
        console.error("Error loading initial movie:", err);
      }
    };

    loadInitialMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMovieId]);

  const removeMovie = (movieId: string) => {
    setListItems((prev) => prev.filter((item) => item.movie_id !== movieId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...listItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setListItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveList = async () => {
    if (!name.trim()) {
      setError("Please enter a list name");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = {
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
        items: listItems.map((item) => ({ movie_id: item.movie_id })),
      };

      if (listId) {
        // Update existing list using server action
        const result = await updateList(listId, formData);

        if (!result.success) {
          setError(result.error || "Failed to update list");
          return;
        }

        setLastSaved(new Date());
      } else {
        // Create new list using server action
        const result = await createList(formData);

        if (!result.success) {
          setError(result.error || "Failed to create list");
          return;
        }

        if (result.listId) {
          if (redirect) {
            router.push(redirect);
          } else {
            router.push(`/list/${result.listId}`);
          }
        }
        return;
      }
    } catch (err: unknown) {
      console.error("Error saving list:", err);
      const message = err instanceof Error ? err.message : "Failed to save list";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 120) return "1 minute ago";
    return `${Math.floor(diff / 60)} minutes ago`;
  };

  const getYearFromDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="space-y-6">
        <input
          type="text"
          placeholder="Name your list..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-none p-0 text-4xl md:text-5xl font-black text-white placeholder:text-neutral-600 focus:ring-0 focus:outline-none"
          autoFocus
        />

        <Textarea
          rows={3}
          placeholder="Add a description (Markdown supported)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-neutral-900/50 border-neutral-800 resize-none font-mono text-sm"
        />

        <div className="flex items-center justify-between bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-white flex items-center gap-2">
              {isPublic ? (
                <Unlock className="w-4 h-4 text-neutral-400" />
              ) : (
                <Lock className="w-4 h-4 text-neutral-400" />
              )}
              {isPublic ? "Public List" : "Private List"}
            </Label>
            <p className="text-xs text-neutral-500">
              {isPublic
                ? "Anyone can see this list on your profile."
                : "Only you can see this list."}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
      </header>

      <hr className="border-neutral-800" />

      {/* Main Editor Section */}
      <section className="flex flex-col md:flex-row gap-8 relative">
        {/* Search Panel */}
        <div className="w-full md:w-5/12 relative z-20">
          <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">
            Find Movies
          </h3>

          <div ref={searchRef} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) performSearchImmediate(searchQuery);
              }}
              className="pl-12 bg-neutral-900 border-neutral-800"
            />

            {/* Search Results Dropdown */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-auto max-h-64 sm:max-h-80 md:max-h-96 z-30 ring-1 ring-white/5">
                {isSearching ? (
                  <div className="p-4 text-center text-neutral-400 text-sm">
                    Searching...
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((movie) => (
                      <li
                        key={movie.id}
                        className="flex items-center gap-3 p-3 hover:bg-neutral-800 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-0 group"
                        onClick={() => addMovie(movie)}
                      >
                        <div className="relative w-10 h-14 rounded-sm overflow-hidden bg-neutral-800 shrink-0">
                          {movie.poster_url ? (
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-4 h-4 text-neutral-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {movie.title}
                          </h4>
                          <span className="text-xs text-neutral-500">
                            {getYearFromDate(movie.release_date)}
                          </span>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 group-hover:text-brand-400 group-hover:border-brand-500 flex items-center justify-center transition-all">
                          <Plus className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* List Items Panel */}
        <div className="w-full md:w-7/12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
              List Items{" "}
              <span className="text-neutral-500">({listItems.length})</span>
            </h3>
            <span className="text-xs text-neutral-500">Drag to reorder</span>
          </div>

          <div className="space-y-3">
              {listItems.length === 0 ? (
              <div className="text-center py-12 px-4 text-neutral-500 text-sm bg-neutral-900/30 border border-dashed border-neutral-800 rounded-lg">
                <p>Your list is empty. Search for movies to add them.</p>
              </div>
            ) : (
              listItems.map((item, index) => (
                <div
                  key={`${item.movie_id}-${index}`}
                  className={`flex items-center gap-4 bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 group hover:border-neutral-700 hover:bg-neutral-900 transition-all ${
                    draggedIndex === index
                      ? "opacity-50 border-brand-500 bg-brand-500/10"
                      : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="text-neutral-600 cursor-grab hover:text-neutral-400 px-1">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-neutral-500 w-6 text-center">
                    {index + 1}
                  </div>
                  <div className="relative w-10 h-14 rounded-sm overflow-hidden bg-neutral-800 border border-neutral-800 shrink-0">
                    {item.movie.poster_url ? (
                      <Image
                        src={item.movie.poster_url}
                        alt={item.movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-4 h-4 text-neutral-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.movie.title}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {getYearFromDate(item.movie.release_date)}
                    </span>
                  </div>
                  <button
                    className="text-neutral-500 hover:text-red-500 p-2 transition-colors"
                    onClick={() => removeMovie(item.movie_id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="mt-12 pt-8 border-t border-neutral-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-xs text-neutral-500">
                Last saved {formatLastSaved()}
              </span>
            )}
            {error && (
              <span className="text-xs text-red-500">{error}</span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={redirect || "/"}
              className="px-6 py-3 sm:py-2 rounded-lg sm:rounded-full text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors text-center border border-neutral-800 sm:border-0"
            >
              Cancel
            </Link>
            <Button
              onClick={saveList}
              disabled={isSaving}
              className="px-6 py-3 sm:py-2 rounded-lg sm:rounded-full text-sm font-bold text-black bg-brand-500 hover:bg-brand-400 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all active:scale-95 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save List"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

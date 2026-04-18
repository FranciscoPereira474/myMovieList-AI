"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CommentVoteButtons } from "@/components/ui/comment-vote-buttons";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Edit3,
  Film,
  Clock,
  ListOrdered,
  Info,
  Lock,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { postListComment } from "@/app/actions/lists";

interface Movie {
  id: string;
  title: string;
  release_date: string;
  poster_url: string;
  slug?: string | null;
}

interface ListItem {
  movie_id: string;
  movie: Movie;
  rating?: { avg_rating: number; rating_count: number } | null;
}

interface ListAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ListData {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  user_id: string;
  author: ListAuthor;
  items: ListItem[];
  save_count: number;
}

interface Comment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
}

/**
 * This is a React component that renders a movie list page with various features such as commenting, voting, and deleting comments. Here's a breakdown of the code:
 *
 * **Layout**
 *
 * The component uses a grid layout to display the movies, with each movie represented by a card-like element.
 *
 * **Movie Cards**
 *
 * Each movie card contains the following elements:
 *
 * * A poster image (if available) or a default film icon
 * * The movie title and release year
 * * A rating system (using StarRating components)
 * * A link to the movie's details page
 *
 * The movie cards are generated using an array of objects, where each object represents a movie with its corresponding data.
 *
 * **Comments Section**
 *
 * The comments section is displayed below the movies grid. It contains:
 *
 * * A comment form that allows users to submit new comments
 * * A list of existing comments, each with the following information:
 * 	+ The user who made the comment (with a link to their profile)
 * 	+ The comment text and timestamp
 * 	+ A delete button for the commenter
 * 	+ A rating system (using CommentVoteButtons components)
 *
 * **Comment Form**
 *
 * The comment form is a simple textarea that allows users to input their comments. When the form is submitted, it sends a request to the server to create a new comment.
 *
 * **Rating System**
 *
 * The rating system uses StarRating components to display the average rating of each movie. The user can also vote on individual comments using CommentVoteButtons components.
 *
 * **Deleting Comments**
 *
 * When a commenter clicks the delete button next to their comment, it sends a request to the server to delete the comment.
 *
 * Overall, this component provides a basic structure for displaying movies and allowing users to interact with them through commenting and voting. However, there are some potential issues with the code:
 *
 * * The `comments` array is not updated in real-time when new comments are added or deleted.
 * * There is no validation on user input (e.g., checking if the comment text is empty).
 * * The rating system does not handle cases where a movie has no ratings.
 * * The delete functionality only works for the commenter's own comments.
 *
 * To improve this code, you could consider adding features such as:
 *
 * * Real-time updates to the comments array
 * * Input validation and sanitization
 * * Handling of edge cases (e.g., no ratings for a movie)
 * * Improved styling and layout
 *
 * Here is an example of how you might refactor the comment form to include input validation:
 * jsx
 * <form onSubmit={handleSubmitComment}>
 *   <textarea
 *     rows={3}
 *     className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-200 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none placeholder-neutral-600"
 *     value={commentText}
 *     onChange={(e) => setCommentText(e.target.value)}
 *   />
 *   {error && <div className="text-red-500">{error}</div>}
 *   <button type="submit" size="sm" disabled={isSubmittingComment || !commentText.trim()}>
 *     {isSubmittingComment ? "Posting..." : "Post comment"}
 *   </button>
 * </form>
 *
 * And here is an example of how you might refactor the delete functionality to handle edge cases:
 * jsx
 * const handleDeleteComment = (commentId) => {
 *   if (!currentUser || !currentUser.id) return;
 *   fetch(`/comments/${commentId}`, {
 *     method: 'DELETE',
 *     headers: { 'Content-Type': 'application/json' },
 *   })
 *     .then((response) => response.json())
 *     .then((data) => console.log(data))
 *     .catch((error) => console.error(error));
 * };
 *
 * Note that these are just examples, and you may need to modify them to fit your specific use case.
 */
export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;
  const supabase = createBrowserClient();

  const [listData, setListData] = useState<ListData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username?: string | null; avatar_url?: string | null } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingComments, setConfirmingComments] = useState<Record<string, boolean>>({});
  const [deletingComments, setDeletingComments] = useState<Record<string, boolean>>({});
  // Delete list confirmation & deleting state (owner only)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);

  const getTotalRuntime = (itemCount: number) => {
    const totalMinutes = itemCount * 120;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getYearFromDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  // Helper to fetch and set comments for the current list
  const fetchComments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, user_id, body, created_at")
        .eq("list_id", listId)
        .order("created_at", { ascending: false });

      const transformedComments: Comment[] = await Promise.all(
        (commentsData || []).map(
          async (comment: {
            id: string;
            user_id: string;
            body: string;
            created_at: string;
          }) => {
            const { data: commentUser } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", comment.user_id)
              .single();

            const [{ count: upvotes }, { count: downvotes }] = await Promise.all([
              supabase
                .from("comment_votes")
                .select("*", { count: "exact", head: true })
                .eq("comment_id", comment.id)
                .eq("vote_type", 1),
              supabase
                .from("comment_votes")
                .select("*", { count: "exact", head: true })
                .eq("comment_id", comment.id)
                .eq("vote_type", -1),
            ]);

            let userVote: "up" | "down" | null = null;
            if (user) {
              const { data: voteData } = await supabase
                .from("comment_votes")
                .select("vote_type")
                .eq("comment_id", comment.id)
                .eq("user_id", user.id)
                .single();

              if (voteData) {
                userVote = voteData.vote_type === 1 ? "up" : "down";
              }
            }

            return {
              id: comment.id,
              user_id: comment.user_id,
              body: comment.body,
              created_at: comment.created_at,
              user: {
                username: commentUser?.username || "Unknown",
                avatar_url: commentUser?.avatar_url,
              },
              upvotes: upvotes || 0,
              downvotes: downvotes || 0,
              userVote,
            };
          }
        )
      );

      setComments(transformedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!listId) {
        setError("Invalid list ID");
        setIsLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", user.id)
            .single();
          setCurrentUser({ id: user.id, username: profile?.username || null, avatar_url: profile?.avatar_url || null });
        } else {
          setCurrentUser(null);
        }

        // Fetch the list
        const { data: list, error: listError } = await supabase
          .from("lists")
          .select("id, name, description, is_public, created_at, user_id")
          .eq("id", listId)
          .single();

        if (listError || !list) {
          setError("List not found");
          setIsLoading(false);
          return;
        }

        // Check if list is private and user doesn't own it
        if (!list.is_public && (!user || user.id !== list.user_id)) {
          setError("This list is private");
          setIsLoading(false);
          return;
        }

        // Fetch author info
        const { data: authorData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", list.user_id)
          .single();

        // Fetch list items with movie details
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
            rating: null,
          })
        );

        // Fetch save count via server API (uses service role) to avoid RLS hiding saves
        let saveCount = 0;
        try {
          const res = await fetch(`/api/lists/${listId}/save-count`);
          if (res.ok) {
            const json = await res.json();
            saveCount = json.count ?? 0;
          } else {
            // Try to read error body for better diagnostics
            try {
              const errJson = await res.json();
              console.error("Failed to fetch save count", res.status, errJson);
            } catch (_e) {
              console.error("Failed to fetch save count", res.status, _e);
            }

            // Fallback: attempt client-side count (may be affected by RLS)
            try {
              const { count: clientCount, error: clientError } = await supabase
                .from("list_saves")
                .select("*", { count: "exact", head: true })
                .eq("list_id", listId);

              if (!clientError) {
                saveCount = clientCount ?? 0;
              } else {
                console.error("Client-side fallback count error:", clientError);
              }
            } catch (_e) {
              console.error("Client-side fallback count unexpected error:", _e);
            }
          }
        } catch (err) {
          console.error("Error fetching save count:", err);
          // As a last resort, attempt client-side count
          try {
            const { count: clientCount, error: clientError } = await supabase
              .from("list_saves")
              .select("*", { count: "exact", head: true })
              .eq("list_id", listId);

            if (!clientError) {
              saveCount = clientCount ?? 0;
            } else {
              console.error("Client-side fallback count error:", clientError);
            }
          } catch (e) {
            console.error("Client-side fallback count unexpected error:", e);
          }
        }

        // Check if current user has saved this list
        if (user) {
          const { data: saveData } = await supabase
            .from("list_saves")
            .select("*")
            .eq("list_id", listId)
            .eq("user_id", user.id)
            .single();

          setIsSaved(!!saveData);
        }

        // Fetch comments for this list (use helper defined below)
        await fetchComments();

        setListData({
          id: list.id,
          name: list.name,
          description: list.description || "",
          is_public: list.is_public ?? true,
          created_at: list.created_at,
          user_id: list.user_id,
          author: {
            id: authorData?.id || list.user_id,
            username: authorData?.username || "Unknown",
            avatar_url: authorData?.avatar_url || null,
          },
          items: transformedItems,
          save_count: saveCount || 0,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching list:", err);
        setError("Failed to load list");
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, supabase]);

  // If we finished loading and there is an error, show a friendly empty state
  if (!isLoading && error) {
    // Specifically map "List not found" to the friendly not-found UI
    return (
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 py-28">
        <EmptyState
          type={error === "List not found" ? "no-data" : "error"}
          icon={(
            <svg className="text-neutral-400" xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor" aria-hidden>
              <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z" />
            </svg>
          )}
          title={error === "List not found" ? "List not found" : "Error"}
          description={
            error === "List not found"
              ? "We couldn't find this list. It may have been removed or the link might be incorrect."
              : "An error occurred while loading this list. Please try again."
          }
          action={{ label: "Go home", href: "/" }}
          secondaryAction={{ label: "Browse lists", href: "/lists" }}
        />
      </main>
    );
  }

  const handleSaveList = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/list/${listId}`);
      return;
    }

    if (isOwner) {
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from("list_saves")
          .delete()
          .eq("list_id", listId)
          .eq("user_id", currentUser.id);

        setIsSaved(false);
        setListData((prev) =>
          prev ? { ...prev, save_count: prev.save_count - 1 } : prev
        );
      } else {
        await supabase
          .from("list_saves")
          .insert({ list_id: listId, user_id: currentUser.id });

        setIsSaved(true);
        setListData((prev) =>
          prev ? { ...prev, save_count: prev.save_count + 1 } : prev
        );
      }
    } catch (err) {
      console.error("Error saving list:", err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      router.push(`/login?redirect=/list/${listId}`);
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);

    try {
      // Use server action to post comment with sanitization
      const result = await postListComment(listId, commentText.trim());

      if (!result.success) {
        console.error("Error posting comment:", result.error);
        setIsSubmittingComment(false);
        return;
      }

      // If the server returns the created comment, optimistically prepend it
      // to the comments array so the UI updates immediately. Otherwise
      // refresh comments from the server as a fallback.
      // Re-fetch comments from the server so the newly-posted, sanitized
      // comment appears without needing a full page refresh.
      await fetchComments();
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=/list/${listId}`);
      return;
    }

    // If not confirming yet, set confirming state and auto-clear after 3s
    if (!confirmingComments[commentId]) {
      setConfirmingComments((prev) => ({ ...prev, [commentId]: true }));
      setTimeout(() => {
        setConfirmingComments((prev) => {
          const copy = { ...prev };
          delete copy[commentId];
          return copy;
        });
      }, 3000);
      return;
    }

    // Proceed to delete
    setDeletingComments((prev) => ({ ...prev, [commentId]: true }));
    // Optimistically remove from UI
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", currentUser.id);
    } catch (err) {
      console.error("Error deleting comment:", err);
      router.refresh?.();
    } finally {
      setDeletingComments((prev) => {
        const copy = { ...prev };
        delete copy[commentId];
        return copy;
      });
      setConfirmingComments((prev) => {
        const copy = { ...prev };
        delete copy[commentId];
        return copy;
      });
    }
  };

  const handleDeleteList = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/list/${listId}`);
      return;
    }

    // First click to confirm
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }

    setIsDeletingList(true);

    try {
      // Delete saves for this list
      await supabase.from("list_saves").delete().eq("list_id", listId);

      // Delete comment votes for comments on this list (if any)
      const commentIds = comments.map((c) => c.id);
      if (commentIds.length > 0) {
        await supabase.from("comment_votes").delete().in("comment_id", commentIds);
      }

      // Delete comments
      await supabase.from("comments").delete().eq("list_id", listId);

      // Delete list items
      await supabase.from("list_items").delete().eq("list_id", listId);

      // Finally delete the list (owner only)
      await supabase.from("lists").delete().eq("id", listId).eq("user_id", currentUser.id);

      // Redirect home after deletion
      router.push("/");
    } catch (err) {
      console.error("Error deleting list:", err);
    } finally {
      setIsDeletingList(false);
      setIsConfirmingDelete(false);
    }
  };

  if (isLoading) {
    return (
      <main className="pt-24 pb-20">
        <div className="min-h-screen">
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 pb-20 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-neutral-400 mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="default">
          Go Back
        </Button>
      </main>
    );
  }

  if (!listData) return null;

  const isOwner = currentUser?.id === listData.user_id;

  return (
    <main>
      {/* Hero Header */}
      <header className="relative w-full pt-32 pb-16 overflow-hidden border-b border-neutral-800">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {listData.items[0]?.movie.poster_url && (
            <Image
              src={listData.items[0].movie.poster_url}
              alt=""
              fill
              className="object-cover blur-3xl opacity-40 scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* List Badge */}
          <div className="inline-flex items-center gap-2 mb-4 bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-neutral-300">
            <ListOrdered className="w-3.5 h-3.5 text-brand-400" />
            <span>Ranked List</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight truncate flex items-center justify-center gap-3">
            <span className="truncate">{listData.name}</span>
            {!listData.is_public && (
              <Lock className="w-5 h-5 text-neutral-500" />
            )}
          </h1>

          {/* Author & Stats */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 text-sm">
            <Link
              href={`/users/${listData.author.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                src={listData.author.avatar_url}
                alt={listData.author.username}
                size="sm"
              />
              <span className="text-neutral-300">
                Curated by{" "}
                <strong className="text-white">
                  {listData.author.username}
                </strong>
              </span>
            </Link>

            <div className="flex items-center gap-4 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                {listData.items.length} Movies
              </span>
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-brand-400" />
                {listData.save_count} Saves
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {getTotalRuntime(listData.items.length)}
              </span>
            </div>
          </div>

          {/* Description */}
          {listData.description && (
            <p className="max-w-2xl mx-auto mb-8 text-neutral-300 text-base md:text-lg leading-relaxed break-all">
              {listData.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {currentUser && !isOwner && (
              <Button
                variant={isSaved ? "default" : "outline"}
                onClick={handleSaveList}
                className={`rounded-full ${
                  isSaved
                    ? "bg-brand-500 text-black hover:bg-brand-400"
                    : "border-neutral-500 hover:border-white hover:bg-white hover:text-black"
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {isSaved ? "Saved" : "Save this List"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleShare}
              className="rounded-full border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Share"}
            </Button>

            {isOwner && (
              <>
                <Link href={`/list/${listId}/edit`}>
                  <Button
                    variant="outline"
                    className="rounded-full border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList();
                  }}
                  disabled={isDeletingList}
                  title={isConfirmingDelete ? "Click to confirm delete" : "Delete list"}
                  className="relative w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingList ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500 absolute inset-0 m-auto" />
                  ) : (
                    <>
                      <Trash2
                        className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${isConfirmingDelete ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
                      />
                      <Check
                        className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${isConfirmingDelete ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                      />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Movies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
          {listData.items.map((item, index) => {
            const content = (
              <>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 shadow-lg group-hover:shadow-brand-500/20 transition-all duration-300 group-hover:scale-[1.02] border border-neutral-800">
                  {item.movie.poster_url ? (
                    <Image
                      src={item.movie.poster_url}
                      alt={item.movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-12 h-12 text-neutral-700" />
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div
                    className={`absolute top-0 left-0 backdrop-blur px-3 py-1 rounded-br-lg shadow-lg z-10 font-black ${
                      index === 0
                        ? "bg-white/90 text-black text-xl"
                        : "bg-neutral-800/90 text-white text-lg"
                    }`}
                  >
                    #{String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Info className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white truncate">
                      {item.movie.title}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {getYearFromDate(item.movie.release_date)}
                    </span>
                  </div>
                  {item.rating?.avg_rating && (
                    <div className="flex-shrink-0 pt-1">
                      <StarRating value={item.rating.avg_rating} size="xs" />
                    </div>
                  )}
                </div>
              </>
            );

            // Strict slug-only navigation: only link when movie.slug is present.
            // This prevents UUIDs from being sent to the movie route.
            if (item.movie.slug) {
              return (
                <Link key={item.movie_id} href={`/movies/${item.movie.slug}`} className="group cursor-pointer">
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.movie_id} className="group cursor-default">
                {content}
              </div>
            );
          })}

          {listData.items.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Film className="w-16 h-16 mx-auto mb-4 text-neutral-700" />
              <p className="text-neutral-500">This list is empty</p>
            </div>
          )}
        </div>
      </section>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h3 className="text-xl font-bold text-white mb-6">
          Comments{" "}
          <span className="text-neutral-500 text-base font-normal ml-2">
            ({comments.length})
          </span>
        </h3>

        {/* Comment Form */}
        {!currentUser ? (
          <div className="bg-neutral-900 rounded-lg p-4 mb-8 border border-neutral-800">
            <p className="text-sm text-neutral-400 text-center">
              <Link
                href={`/login?redirect=/list/${listId}`}
                className="text-brand-400 hover:text-brand-300 hover:underline font-medium"
              >
                Sign in
              </Link>{" "}
              to comment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className="flex gap-4 mb-10">
            <Link href={currentUser?.username ? `/users/${currentUser.username}` : `/users/${currentUser?.id}`} className="hover:opacity-80 transition-opacity">
              <UserAvatar
                src={currentUser?.avatar_url ?? null}
                alt={currentUser?.username ?? "You"}
                size="md"
              />
            </Link>
            <div className="flex-1">
              <textarea
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-200 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none placeholder-neutral-600"
                placeholder="Share your thoughts on this list..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="rounded-md bg-brand-500 hover:bg-brand-400 text-black cursor-pointer disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
                >
                  {isSubmittingComment ? "Posting..." : "Post comment"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Link
                href={`/users/${comment.user.username}`}
                className="hover:opacity-80 transition-opacity"
              >
                <UserAvatar
                  src={comment.user.avatar_url}
                  alt={comment.user.username}
                  size="md"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/users/${comment.user.username}`}
                    className="font-bold text-neutral-200 text-sm hover:underline"
                  >
                    {comment.user.username}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    {currentUser?.id === comment.user_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComment(comment.id);
                        }}
                        disabled={deletingComments[comment.id]}
                        className="relative w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={confirmingComments[comment.id] ? "Click to confirm delete" : "Delete comment"}
                      >
                        {deletingComments[comment.id] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500 absolute inset-0 m-auto" />
                        ) : (
                          <>
                            <Trash2
                              className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${confirmingComments[comment.id] ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
                            />
                            <Check
                              className={`h-3.5 w-3.5 text-red-500 hover:text-red-400 absolute inset-0 m-auto transition-all duration-200 ease-out ${confirmingComments[comment.id] ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                            />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-2 break-words break-all">
                  {comment.body}
                </p>
                <CommentVoteButtons
                  commentId={comment.id}
                  initialUpvotes={comment.upvotes}
                  initialDownvotes={comment.downvotes}
                  initialUserVote={comment.userVote}
                  isLoggedIn={!!currentUser}
                />
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

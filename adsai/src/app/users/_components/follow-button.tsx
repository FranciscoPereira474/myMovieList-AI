"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { followUser, unfollowUser } from "../_lib/actions";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

/**
 * Follow Button Component - Client Component
 * Allows users to follow/unfollow other users.
 * Optimistically updates UI while request is in progress.
 */
export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Sync state with server when initialIsFollowing changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleClick = async () => {
    setError(null);
    
    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    startTransition(async () => {
      try {
        if (previousState) {
          await unfollowUser(targetUserId);
        } else {
          await followUser(targetUserId);
        }
        router.refresh();
      } catch (err: unknown) {
        // Revert on error
        setIsFollowing(previousState);
        
        const error = err as { message?: string };
        // Check if it's an authentication error
        if (error.message === "Not authenticated") {
          setError("Please log in to follow users");
        } else {
          setError("Failed to update follow status");
          console.error("Follow action failed:", err);
        }
      }
    });
  };

  return (
    <div className="space-y-2">
      {isFollowing ? (
        <button
          onClick={handleClick}
          disabled={isPending}
          className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "..." : "Following"}
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-black font-bold text-sm transition-colors shadow-[0_0_10px_rgba(34,197,94,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "..." : "+ Follow"}
        </button>
      )}
      
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}
    </div>
  );
}

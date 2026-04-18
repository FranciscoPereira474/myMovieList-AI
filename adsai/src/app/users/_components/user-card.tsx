import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    favorites: Array<{
      id: string;
      title: string;
      slug: string;
      poster_url: string | null;
    }>;
    isFollowing: boolean;
    isCurrentUser: boolean;
  };
}

/**
 * User Card Component
 * Displays a user's avatar, username, and bio in a card layout.
 * Links to the user's profile page.
 */
export function UserCard({ user }: UserCardProps) {
  // Generate initials from username for avatar fallback
  const initials = user.username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm hover:border-neutral-700 transition-all group">
      <Link href={`/users/${user.username}`} className="block">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12 border border-neutral-800">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback className="bg-neutral-800 text-neutral-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-400 transition-colors truncate">
              @{user.username}
            </h3>
          </div>
        </div>

        {user.bio && (
          <p className="text-neutral-400 text-sm mb-4 line-clamp-1">
            {user.bio}
          </p>
        )}

        {!user.bio && (
          <p className="text-neutral-500 text-sm italic mb-4">
            No bio yet
          </p>
        )}
      </Link>

      {/* Favorites Section */}
      <div className="mb-5">
        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2">
          Favorites
        </p>
        {user.favorites.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {user.favorites.map((movie) => (
              movie.slug ? (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.slug}`}
                  className="block"
                >
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={100}
                      height={150}
                      className="rounded aspect-[2/3] object-cover border border-neutral-800 hover:opacity-80 transition-opacity w-full"
                    />
                  ) : (
                    <div className="rounded aspect-[2/3] bg-neutral-800 border border-neutral-700 flex items-center justify-center w-full">
                      <span className="text-neutral-600 text-xs text-center px-1">
                        No Image
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <div key={movie.id} className="block">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={100}
                      height={150}
                      className="rounded aspect-[2/3] object-cover border border-neutral-800 hover:opacity-80 transition-opacity w-full"
                    />
                  ) : (
                    <div className="rounded aspect-[2/3] bg-neutral-800 border border-neutral-700 flex items-center justify-center w-full">
                      <span className="text-neutral-600 text-xs text-center px-1">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm italic">No movies rated.</p>
        )}
      </div>

      {/* Follow Button */}
      {!user.isCurrentUser && (
        <div className="mt-auto">
          <FollowButton
            targetUserId={user.id}
            initialIsFollowing={user.isFollowing}
          />
        </div>
      )}
    </div>
  );
}

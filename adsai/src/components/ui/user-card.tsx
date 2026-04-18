"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { Button } from "./button";
import { Plus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface UserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** User information */
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
  };
  /** Array of favorite movie poster URLs (max 3) */
  favoritePosterUrls?: string[];
  /** Whether current user follows this user */
  isFollowing?: boolean;
  /** Callback when follow button is clicked */
  onFollowClick?: () => void;
  /** Stats to display */
  stats?: {
    followers?: number;
    following?: number;
    watched?: number;
  };
}

/**
 * * Renders a user card component with the provided props.
 *  *
 *  * @param {UserCardProps} props - The properties to be passed to the component.
 *  * @returns {JSX.Element} The rendered user card component.
 *  
 * export function UserCard({
 *   user,
 *   favoritePosterUrls = [],
 *   isFollowing = false,
 *   onFollowClick,
 *   stats,
 *   className,
 *   ...props
 * }: UserCardProps) {
 *   return (
 *     <div
 *       className={cn(
 *         "bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm hover:border-neutral-700 transition-all group",
 *         className
 *       )}
 *       {...props}
 *     >
 *       {/* Header: Avatar + Name }
 *       <div className="flex items-start justify-between mb-3">
 *         <div className="flex gap-3">
 *           <Link href={`/users/${user.username}`}>
 *             <UserAvatar
 *               src={user.avatarUrl}
 *               alt={user.name}
 *               size="xl"
 *               className="group-hover:border-brand-500/50 transition-colors"
 *             />
 *           </Link>
 *           <div>
 *             <Link href={`/users/${user.username}`}>
 *               <h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-400 transition-colors">
 *                 {user.name}
 *               </h3>
 *             </Link>
 *             <div className="text-neutral-500 text-sm">@{user.username}</div>
 *           </div>
 *         </div>
 *       </div>
 *
 *       {/* Bio }
 *       {user.bio && (
 *         <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{user.bio}</p>
 *       )}
 *
 *       {/* Favorite Posters }
 *       {favoritePosterUrls.length > 0 && (
 *         <div className="mb-5">
 *           <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2">
 *             Favorites
 *           </p>
 *           <div className="grid grid-cols-3 gap-2">
 *             {favoritePosterUrls.slice(0, 3).map((url, index) => (
 *               <div
 *                 key={index}
 *                 className="aspect-2/3 rounded overflow-hidden border border-neutral-800 hover:opacity-80 transition-opacity relative"
 *               >
 *                 <Image
 *                   src={url}
 *                   alt={`Favorite ${index + 1}`}
 *                   fill
 *                   className="object-cover"
 *                   sizes="100px"
 *                 />
 *               </div>
 *             ))}
 *           </div>
 *         </div>
 *       )}
 *
 *       {/* Follow Button }
 *       <Button
 *         onClick={onFollowClick}
 *         variant={isFollowing ? "outline" : "default"}
 *         className={cn(
 *           "w-full",
 *           !isFollowing &&
 *             "bg-brand-600 hover:bg-brand-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.2)]"
 *         )}
 *       >
 *         {isFollowing ? (
 *           <>
 *             <Check size={16} />
 *             Following
 *           </>
 *         ) : (
 *           <>
 *             <Plus size={16} />
 *             Follow
 *           </>
 *         )}
 *       </Button>
 *     </div>
 *   );
 * }
 */
export function UserCard({
  user,
  favoritePosterUrls = [],
  isFollowing = false,
  onFollowClick,
  className,
  ...props
}: UserCardProps) {
  return (
    <div
      className={cn(
        "bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm hover:border-neutral-700 transition-all group",
        className
      )}
      {...props}
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <Link href={`/users/${user.username}`}>
            <UserAvatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="group-hover:border-brand-500/50 transition-colors"
            />
          </Link>
          <div>
            <Link href={`/users/${user.username}`}>
              <h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-400 transition-colors">
                {user.name}
              </h3>
            </Link>
            <div className="text-neutral-500 text-sm">@{user.username}</div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{user.bio}</p>
      )}

      {/* Favorite Posters */}
      {favoritePosterUrls.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2">
            Favorites
          </p>
          <div className="grid grid-cols-3 gap-2">
            {favoritePosterUrls.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="aspect-2/3 rounded overflow-hidden border border-neutral-800 hover:opacity-80 transition-opacity relative"
              >
                <Image
                  src={url}
                  alt={`Favorite ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow Button */}
      <Button
        onClick={onFollowClick}
        variant={isFollowing ? "outline" : "default"}
        className={cn(
          "w-full",
          !isFollowing &&
            "bg-brand-600 hover:bg-brand-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.2)]"
        )}
      >
        {isFollowing ? (
          <>
            <Check size={16} />
            Following
          </>
        ) : (
          <>
            <Plus size={16} />
            Follow
          </>
        )}
      </Button>
    </div>
  );
}

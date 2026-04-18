import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserProfile,
  getCurrentUser,
  getFollowing,
  getFollowingCount,
  enrichUsersWithExtras,
} from "../_lib/queries";
import { UserCard } from "@/app/users/_components/user-card";

interface FollowingPageProps {
  params: Promise<{ username: string }>;
}

/**
 * * Displays the user's following page.
 *  *
 *  * @param {FollowingPageProps} params - The parameters for the page.
 *  * @returns {JSX.Element} The JSX element representing the following page.
 *  
 * export default async function FollowingPage({ params }: FollowingPageProps) {
 *   const { username } = await params;
 *
 *   const profile = await getUserProfile(username);
 *   if (!profile) return notFound();
 *
 *   const currentUser = await getCurrentUser();
 *
 *   const [following, followingCount] = await Promise.all([
 *     getFollowing(profile.id),
 *     getFollowingCount(profile.id),
 *   ]);
 *
 *   const followingWithExtras = await enrichUsersWithExtras(following, currentUser?.id ?? null);
 *
 *   return (
 *     <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *       {/* ... }
 *     </main>
 *   );
 * }
 */
export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;

  const profile = await getUserProfile(username);
  if (!profile) return notFound();

  const currentUser = await getCurrentUser();

  const [following, followingCount] = await Promise.all([
    getFollowing(profile.id),
    getFollowingCount(profile.id),
  ]);

  const followingWithExtras = await enrichUsersWithExtras(following, currentUser?.id ?? null);

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-neutral-800 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <Link href={`/users/${profile.username}`} className="hover:text-brand-400 transition-colors">@{profile.username}</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span>Network</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Following <span className="text-neutral-500 text-lg font-normal ml-2">{followingCount.toLocaleString()}</span></h1>
        </div>

        <div className="hidden sm:flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <Link href={`/users/${profile.username}/followers`} className="px-4 py-1.5 rounded-md text-neutral-400 hover:text-white transition-colors text-sm font-medium">Followers</Link>
          <Link href={`/users/${profile.username}/following`} className="px-4 py-1.5 rounded-md bg-neutral-800 text-white shadow text-sm font-medium">Following</Link>
        </div>
      </div>

      {followingWithExtras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followingWithExtras.map((followedUser) => (
            <UserCard key={followedUser.id} user={followedUser} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20"><p className="text-neutral-400 text-lg">@{profile.username} is not following anyone yet</p></div>
      )}
    </main>
  );
}

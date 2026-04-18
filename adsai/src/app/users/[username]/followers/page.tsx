import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserProfile,
  getCurrentUser,
  getFollowers,
  getFollowersCount,
  enrichUsersWithExtras,
} from "../_lib/queries";
import { UserCard } from "@/app/users/_components/user-card";

interface FollowersPageProps {
  params: Promise<{ username: string }>;
}

/**
 * * Renders the Followers page for a given user.
 *  *
 *  * @param {FollowersPageProps} params - The props passed to this component.
 *  * @returns {JSX.Element} The JSX element representing the Followers page.
 *  
 * export default async function FollowersPage({ params }: FollowersPageProps) {
 *   const { username } = await params;
 *
 *   const profile = await getUserProfile(username);
 *   if (!profile) return notFound();
 *
 *   const currentUser = await getCurrentUser();
 *
 *   const [followers, followersCount] = await Promise.all([
 *     getFollowers(profile.id),
 *     getFollowersCount(profile.id),
 *   ]);
 *
 *   const followersWithExtras = await enrichUsersWithExtras(followers, currentUser?.id ?? null);
 *
 *   return (
 *     // JSX element representing the Followers page
 *   );
 * }
 */
export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;

  const profile = await getUserProfile(username);
  if (!profile) return notFound();

  const currentUser = await getCurrentUser();

  const [followers, followersCount] = await Promise.all([
    getFollowers(profile.id),
    getFollowersCount(profile.id),
  ]);

  const followersWithExtras = await enrichUsersWithExtras(followers, currentUser?.id ?? null);

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-neutral-800 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <Link href={`/users/${profile.username}`} className="hover:text-brand-400 transition-colors">@{profile.username}</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span>Network</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Followers <span className="text-neutral-500 text-lg font-normal ml-2">{followersCount.toLocaleString()}</span></h1>
        </div>

        <div className="hidden sm:flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <Link href={`/users/${profile.username}/followers`} className="px-4 py-1.5 rounded-md bg-neutral-800 text-white shadow text-sm font-medium">Followers</Link>
          <Link href={`/users/${profile.username}/following`} className="px-4 py-1.5 rounded-md text-neutral-400 hover:text-white transition-colors text-sm font-medium">Following</Link>
        </div>
      </div>

      {followersWithExtras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followersWithExtras.map((follower) => (
            <UserCard key={follower.id} user={follower} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20"><p className="text-neutral-400 text-lg">@{profile.username} has no followers yet</p></div>
      )}
    </main>
  );
}

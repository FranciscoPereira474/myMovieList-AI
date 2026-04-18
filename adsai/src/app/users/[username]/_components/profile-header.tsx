"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, Edit2 } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { followUser, unfollowUser, updateBio } from "@/app/users/_lib/actions";
import type { UserProfileDetails, UserStats } from "../_lib/queries";

interface ProfileHeaderProps {
  profile: UserProfileDetails;
  stats: UserStats;
  currentUserId: string | null;
  isFollowing: boolean;
}

/**
 * * ProfileHeader component.
 *  *
 *  * @param {ProfileHeaderProps} props - Component props.
 *  * @returns {JSX.Element} The rendered profile header element.
 *  
 *
 * export function ProfileHeader({ profile, stats, currentUserId, isFollowing: initialIsFollowing }: ProfileHeaderProps) {
 *   // ... (rest of the code remains the same)
 * }
 */
export function ProfileHeader({ profile, stats, currentUserId, isFollowing: initialIsFollowing }: ProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

  useEffect(() => setIsFollowing(initialIsFollowing), [initialIsFollowing]);

  
  const isOwnProfile = currentUserId === profile.id;

  const handleFollowClick = async () => {
    if (!currentUserId || isOwnProfile) return;
    setError(null);
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    startTransition(async () => {
      try {
        if (previousState) await unfollowUser(profile.id);
        else await followUser(profile.id);
        router.refresh();
      } catch (err: unknown) { setIsFollowing(previousState); const error = err as { message?: string }; setError(error.message || "Failed to update follow status"); }
    });
  };

  const handleSaveBio = async () => {
    if (!currentUserId || !isOwnProfile) return;
    setIsSavingBio(true); setError(null);
    try { await updateBio(bioText); setIsEditingBio(false); router.refresh(); } catch (err: unknown) { const error = err as { message?: string }; setError(error.message || "Failed to update bio"); } finally { setIsSavingBio(false); }
  };

  const handleCancelBio = () => { setBioText(profile.bio || ""); setIsEditingBio(false); };

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
      <div className="relative">
        <UserAvatar
          src={profile.avatar_url}
          alt={profile.username}
          size="2xl"
        />
      </div>
      <div className="flex-1 space-y-3 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-white tracking-tight">@{profile.username}</h1></div>
          {currentUserId && !isOwnProfile && (
            <button onClick={handleFollowClick} disabled={isPending} className={`font-bold py-2 px-6 rounded-full transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 ${isFollowing ? "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700" : "bg-brand-500 hover:bg-brand-400 text-neutral-950"}`}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {isOwnProfile ? (
          <div className="space-y-2">{isEditingBio ? (
            <div className="flex flex-col gap-2">
              <textarea value={bioText} onChange={(e) => setBioText(e.target.value)} maxLength={500} className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-200" rows={3} />
              <div className="flex items-center gap-2">
                <button onClick={handleSaveBio} disabled={isSavingBio} className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-medium">{isSavingBio ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : "Save"}</button>
                <button onClick={handleCancelBio} disabled={isSavingBio} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg">Cancel</button>
                <span className="text-xs text-neutral-500 ml-auto">{bioText.length}/500</span>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl"><p className="text-neutral-300 leading-relaxed inline">{profile.bio || "No bio yet. Click edit to add one!"}</p><button onClick={() => setIsEditingBio(true)} className="text-neutral-400 hover:text-brand-400 ml-2"><Edit2 className="w-4 h-4" /></button></div>
          )}</div>
        ) : (profile.bio && <p className="text-neutral-300 max-w-2xl leading-relaxed">{profile.bio}</p>)}

        <div className="flex items-center gap-6 pt-2">
          <Link href={`/users/${profile.username}/followers`} className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors group">
            <span className="font-bold text-white text-lg">{stats.followers_count.toLocaleString()}</span>
            <span className="text-neutral-500 text-sm group-hover:text-brand-400">Followers</span>
          </Link>
          <Link href={`/users/${profile.username}/following`} className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors group">
            <span className="font-bold text-white text-lg">{stats.following_count.toLocaleString()}</span>
            <span className="text-neutral-500 text-sm group-hover:text-brand-400">Following</span>
          </Link>
          <Link href={`/ratings/${profile.username}`} className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors group">
            <span className="font-bold text-white text-lg">{stats.watched_count.toLocaleString()}</span>
            <span className="text-neutral-500 text-sm group-hover:text-brand-400">Watched</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

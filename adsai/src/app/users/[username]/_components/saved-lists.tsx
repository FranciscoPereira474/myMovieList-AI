import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark } from "lucide-react";

interface SavedList { id: string; name: string; description: string | null; is_public: boolean; item_count: number; creator: { id: string; username: string; avatar_url: string | null; } }
interface SavedListsProps { lists: SavedList[]; username: string }

/**
 * * Renders a list of saved lists for the given user.
 *  *
 *  * @param {SavedListsProps} props - The component's properties.
 *  * @param {Object[]} props.lists - An array of saved lists.
 *  * @param {string} props.username - The username of the current user.
 *  *
 *  * @returns {JSX.Element} The rendered list of saved lists.
 */
export function SavedLists({ lists, username }: SavedListsProps) {
  if (lists.length === 0) {
    return (<div className="text-center py-20"><p className="text-neutral-400 text-lg">@{username} hasn&apos;t saved any lists yet</p></div>);
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Saved Lists <span className="text-neutral-500 text-lg font-normal ml-2">{lists.length}</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => {
          const initials = list.creator.username.split(/[\s_-]/).map((part) => part[0]).join("").toUpperCase().slice(0,2);
          return (
            <Link key={list.id} href={`/list/${list.id}`} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20 transition-colors"><Bookmark className="w-5 h-5 text-brand-500" /></div>
                <div className="flex-1 min-w-0"><h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-400 transition-colors truncate">{list.name}</h3><p className="text-neutral-500 text-sm mt-1">{list.item_count} {list.item_count === 1 ? "film" : "films"}</p></div>
              </div>
              {list.description && <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{list.description}</p>}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                <Avatar className="w-6 h-6"><AvatarImage src={list.creator.avatar_url || undefined} alt={list.creator.username} /><AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">{initials}</AvatarFallback></Avatar>
                <span className="text-neutral-500 text-xs">by @{list.creator.username}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

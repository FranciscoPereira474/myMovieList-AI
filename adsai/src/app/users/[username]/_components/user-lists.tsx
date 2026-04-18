import Link from "next/link";
import { List } from "lucide-react";
import type { UserList } from "../_lib/queries";
import { SectionHeader } from "@/components/ui/section-header";

interface UserListsProps {
  lists: UserList[];
  username: string;
}

/**
 * * Renders a user's lists, displaying recently created lists and a message if none exist.
 *  *
 *  * @param {UserListsProps} props - The component's properties.
 *  * @param {Object[]} props.lists - An array of list objects.
 *  * @param {string} props.username - The username of the current user.
 *  * @param {number} props.userId - The ID of the current user.
 *  
 * export function UserLists({ lists, username }: UserListsProps) {
 *   return (
 *     <div className="pt-8 border-t border-neutral-800">
 *       <SectionHeader title="Recently Created Lists" viewAllHref={`/lists/${username}`} />
 *
 *       {lists.length === 0 ? (
 *         <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800"><p className="text-neutral-400 text-sm">@{username} hasn&apos;t created any public lists yet</p></div>
 *       ) : (
 *         <ul className="space-y-3">
 *           {lists.map((list) => (<ListItem key={list.id} list={list} />))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 */
export function UserLists({ lists, username }: UserListsProps) {
  return (
    <div className="pt-8 border-t border-neutral-800">
      <SectionHeader title="Recently Created Lists" viewAllHref={lists.length > 0 ? `/lists/${username}` : undefined} />

      {lists.length === 0 ? (
        <div className="text-center py-8 bg-neutral-900/50 rounded-lg border border-neutral-800"><p className="text-neutral-400 text-sm">@{username} hasn&apos;t created any public lists yet</p></div>
      ) : (
        <ul className="space-y-3">
          {lists.map((list) => (<ListItem key={list.id} list={list} />))}
        </ul>
      )}
    </div>
  );
}

function ListItem({ list }: { list: UserList }) {
  return (
    <li>
      <Link href={`/list/${list.id}`} className="flex items-center justify-between gap-2 group cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded bg-brand-900/20 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0"><List className="w-3 h-3" /></div>
          <span className="text-sm text-neutral-300 group-hover:text-white transition-colors truncate">{list.name}</span>
        </div>
        <span className="text-xs text-neutral-500 shrink-0">{list.item_count} {list.item_count === 1 ? "film" : "films"}</span>
      </Link>
    </li>
  );
}

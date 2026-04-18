import Link from "next/link";
import type { UserList } from "../_lib/queries";
import { List } from "lucide-react";

interface AllListsProps { lists: UserList[]; username: string }

/**
 * * Displays a list of all public lists created by the specified user.
 *  *
 *  * @param {AllListsProps} props - The component's properties.
 *  * @param {Object[]} [props.lists] - An array of list objects.
 *  * @param {string} [props.username] - The username of the user who created the lists.
 *  * @returns {JSX.Element | JSX.Element[]}
 */
export function AllLists({ lists, username }: AllListsProps) {
  if (lists.length === 0) {
    return (<div className="text-center py-20"><p className="text-neutral-400 text-lg">@{username} hasn&apos;t created any public lists yet</p></div>);
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Lists <span className="text-neutral-500 text-lg font-normal ml-2">{lists.length}</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <Link key={list.id} href={`/list/${list.id}`} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20 transition-colors"><List className="w-5 h-5 text-brand-500" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-400 transition-colors truncate">{list.name}</h3>
                <p className="text-neutral-500 text-sm mt-1">{list.item_count} {list.item_count === 1 ? "film" : "films"}</p>
              </div>
            </div>
            {list.description && <p className="text-neutral-400 text-sm line-clamp-2">{list.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}

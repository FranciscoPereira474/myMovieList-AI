import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getLists, type ListSortOption, type ListWithDetails } from "./_lib/queries";
import { ListsGrid, SortSelect } from "./_components";
import { createServerClient } from "@/lib/supabase/server-client";
import { createClient } from "@supabase/supabase-js";

interface ListsPageProps {
  searchParams: Promise<{ sort?: ListSortOption }>;
}

/**
 * * ListsPage component.
 *  *
 *  * @param {ListsPageProps} props - Component props.
 *  * @returns {JSX.Element} The rendered component.
 *  
 * export default async function ListsPage({ searchParams }: ListsPageProps) {
 *   const params = await searchParams;
 *   const sort: ListSortOption = params.sort || "popular_week";
 *
 *   const { lists, hasMore } = await getLists(12, 0, sort);
 *
 *   // Use server Supabase client to fetch auth info and a service-role client to fetch authoritative saves
 *   const supabase = await createServerClient();
 *   const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 *   const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 *   const serviceSupabase = serviceUrl && serviceKey ? createClient(serviceUrl, serviceKey) : null;
 *   const listIds = (lists || []).map((l: { id: string }) => l.id);
 *
 *   let listsWithCounts = lists;
 *   if (listIds.length > 0) {
 *     try {
 *       if (!serviceSupabase) {
 *         console.error("SUPABASE_SERVICE_ROLE_KEY not configured — cannot fetch authoritative save counts");
 *       } else {
 *         const { data: savesData, error: savesError } = await serviceSupabase
 *           .from("list_saves")
 *           .select("list_id")
 *           .in("list_id", listIds as string[]);
 *
 *         if (savesError) {
 *           console.error("Error fetching saves for lists via service key:", savesError);
 *         } else {
 *           const counts: Record<string, number> = {};
 *           (savesData || []).forEach((r: { list_id: string }) => {
 *             counts[r.list_id] = (counts[r.list_id] || 0) + 1;
 *           });
 *
 *           listsWithCounts = (lists || []).map((l: ListWithDetails) => ({
 *             ...l,
 *             save_count: counts[l.id] ?? l.save_count ?? 0,
 *           }));
 *         }
 *       }
 *     } catch (err) {
 *       console.error("Unexpected error fetching saves for lists via service key:", err);
 *       listsWithCounts = lists;
 *     }
 *   }
 *
 *
 *   // If sorting by most_saved, re-order lists by authoritative save_count
 *   if (sort === "most_saved") {
 *     listsWithCounts = [...listsWithCounts].sort((a, b) => (b.save_count || 0) - (a.save_count || 0));
 *   }
 *   // Check server-side auth to determine whether to show create-list action
 *   const {
 *     data: { user },
 *   } = await supabase.auth.getUser();
 *
 *   return (
 *     <main className="pt-24 pb-20 bg-neutral-950">
 *       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         {/* Header }
 *         <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-neutral-800 pb-4 gap-4">
 *           <div>
 *             <h1 className="text-3xl font-bold text-white tracking-tight">
 *               Discover Lists
 *             </h1>
 *             <p className="text-neutral-400 text-sm mt-1">
 *               Collections curated by movie lovers.
 *             </p>
 *           </div>
 *
 *           <div className="flex items-center gap-3">
 *             {user ? (
 *               <Link
 *                 href="/lists/new"
 *                 className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
 *               >
 *                 <Plus size={18} />
 *                 Create List
 *               </Link>
 *             ) : (
 *               <div className="bg-neutral-900 rounded-lg px-4 py-2 border border-neutral-800 text-sm text-neutral-400">
 *                 <Link href={`/login?redirect=/lists`} className="text-brand-400 hover:text-brand-300 hover:underline font-medium">
 *                   Sign in
 *                 </Link>{" "}
 *                 to create lists
 *               </div>
 *             )}
 *
 *             <Suspense fallback={<div className="h-10 w-48 bg-neutral-800 rounded-lg animate-pulse" />}>
 *               <SortSelect currentSort={sort} />
 *             </Suspense>
 *           </div>
 *         </div>
 *
 *         {/* Lists Grid }
 *         {listsWithCounts.length > 0 ? (
 *           <ListsGrid initialLists={listsWithCounts} initialHasMore={hasMore} sort={sort} />
 *         ) : (
 *           <div className="text-center py-20">
 *             <p className="text-neutral-400">No lists found.</p>
 *           </div>
 *         )}
 *       </div>
 *     </main>
 *   );
 * }
 */
export default async function ListsPage({ searchParams }: ListsPageProps) {
  const params = await searchParams;
  const sort: ListSortOption = params.sort || "popular_week";

  const { lists, hasMore } = await getLists(12, 0, sort);

  // Use server Supabase client to fetch auth info and a service-role client to fetch authoritative saves
  const supabase = await createServerClient();
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceSupabase = serviceUrl && serviceKey ? createClient(serviceUrl, serviceKey) : null;
  const listIds = (lists || []).map((l: { id: string }) => l.id);

  let listsWithCounts = lists;
  if (listIds.length > 0) {
    try {
      if (!serviceSupabase) {
        console.error("SUPABASE_SERVICE_ROLE_KEY not configured — cannot fetch authoritative save counts");
      } else {
        const { data: savesData, error: savesError } = await serviceSupabase
          .from("list_saves")
          .select("list_id")
          .in("list_id", listIds as string[]);

        if (savesError) {
          console.error("Error fetching saves for lists via service key:", savesError);
        } else {
          const counts: Record<string, number> = {};
          (savesData || []).forEach((r: { list_id: string }) => {
            counts[r.list_id] = (counts[r.list_id] || 0) + 1;
          });

          listsWithCounts = (lists || []).map((l: ListWithDetails) => ({
            ...l,
            save_count: counts[l.id] ?? l.save_count ?? 0,
          }));
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching saves for lists via service key:", err);
      listsWithCounts = lists;
    }
  }


  // If sorting by most_saved, re-order lists by authoritative save_count
  if (sort === "most_saved") {
    listsWithCounts = [...listsWithCounts].sort((a, b) => (b.save_count || 0) - (a.save_count || 0));
  }
  // Check server-side auth to determine whether to show create-list action
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="pt-24 pb-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-neutral-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Discover Lists
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Collections curated by movie lovers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/lists/new"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Plus size={18} />
                Create List
              </Link>
            ) : (
              <div className="bg-neutral-900 rounded-lg px-4 py-2 border border-neutral-800 text-sm text-neutral-400">
                <Link href={`/login?redirect=/lists`} className="text-brand-400 hover:text-brand-300 hover:underline font-medium">
                  Sign in
                </Link>{" "}
                to create lists
              </div>
            )}

            <Suspense fallback={<div className="h-10 w-48 bg-neutral-800 rounded-lg animate-pulse" />}>
              <SortSelect currentSort={sort} />
            </Suspense>
          </div>
        </div>

        {/* Lists Grid */}
        {listsWithCounts.length > 0 ? (
          <ListsGrid initialLists={listsWithCounts} initialHasMore={hasMore} sort={sort} />
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-400">No lists found.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export const metadata = {
  title: "Discover Lists | CineLog",
  description: "Explore curated movie lists from movie enthusiasts.",
};

import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserListsTabs } from "./_components";
import {
  getUserById,
  getUserCreatedLists,
  getUserSavedLists,
} from "./_lib/queries";
import { createServerClient } from "@/lib/supabase/server-client";

interface UserListsPageProps {
  params: Promise<{ user_id: string }>;
}

/**
 * * Generates metadata for the UserListsPage based on the provided parameters.
 *  *
 *  * @param {UserListsPageProps} params - The page props containing user_id.
 *  * @returns {{ title: string, description: string }} - The generated metadata object.
 */
export async function generateMetadata({ params }: UserListsPageProps) {
  const { user_id } = await params;

  // Attempt to fetch the target user to include username in metadata
  const user = await getUserById(user_id);

  // Check if viewing user is the current user
  const supabase = await createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser && user && authUser.id === user.id) {
    return {
      title: "My Lists | CineLog",
      description: "View and manage your movie lists.",
    };
  }

  const displayName = user?.username ?? user_id;
  return {
    title: `${displayName}'s Lists | CineLog`,
    description: `View lists created and saved by ${displayName}.`,
  };
}

/**
 * * Displays the user's lists page.
 *  *
 *  * @param {UserListsPageProps} props - The component props.
 *  * @returns {JSX.Element} The JSX element representing the user's lists page.
 *  
 * export default async function UserListsPage({ params }: UserListsPageProps) {
 *   const { user_id } = await params;
 *
 *   // Reject requests that supply a UUID-like id — this page is intended
 *   // to be accessed using the username route only. If a UUID is provided
 *   // treat it as not found so we don't accept UUIDs here.
 *   const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 *   if (uuidV4.test(user_id)) {
 *     notFound();
 *   }
 *
 *   const user = await getUserById(user_id);
 *
 *   if (!user) {
 *     notFound();
 *   }
 *
 *   // Check if viewing user is the current user
 *   const supabase = await createServerClient();
 *   const { data: { user: authUser } } = await supabase.auth.getUser();
 *   const isCurrentUser = authUser?.id === user.id;
 *
 *   const [{ lists: createdLists, hasMore: createdHasMore }, { lists: savedLists, hasMore: savedHasMore }] =
 *     await Promise.all([
 *       getUserCreatedLists(user.id, 12, 0, isCurrentUser),
 *       getUserSavedLists(user.id, 12, 0),
 *     ]);
 *
 *   return (
 *     <main className="pt-24 pb-20 bg-neutral-950">
 *       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 *         {/* Header }
 *         <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-neutral-800 pb-4 gap-4">
 *           <div>
 *             <div className="flex items-center gap-3 mb-2">
 *               <UserAvatar
 *                 src={user.avatar_url}
 *                 alt={user.username}
 *                 size="md"
 *               />
 *               <div>
 *                 <h1 className="text-3xl font-bold text-white tracking-tight">
 *                   {isCurrentUser ? "My Lists" : `${user.username}'s Lists`}
 *                 </h1>
 *                 <p className="text-neutral-400 text-sm mt-1">
 *                   {isCurrentUser ? (
 *                     "Your personal movie collections"
 *                   ) : (
 *                     <>
 *                       Collections curated by{" "}
 *                       <Link
 *                         href={`/users/${user.username}`}
 *                         className="text-brand-400 hover:underline"
 *                       >
 *                         @{user.username}
 *                       </Link>
 *                     </>
 *                   )}
 *                 </p>
 *               </div>
 *             </div>
 *           </div>
 *         </div>
 *
 *         {/* Lists Tabs }
 *         <UserListsTabs
 *           username={user.username}
 *           userId={user.id}
 *           isCurrentUser={isCurrentUser}
 *           initialCreatedLists={createdLists}
 *           initialSavedLists={savedLists}
 *           initialCreatedHasMore={createdHasMore}
 *           initialSavedHasMore={savedHasMore}
 *         />
 *       </div>
 *     </main>
 *   );
 * }
 */
export default async function UserListsPage({ params }: UserListsPageProps) {
  const { user_id } = await params;

  // Reject requests that supply a UUID-like id — this page is intended
  // to be accessed using the username route only. If a UUID is provided
  // treat it as not found so we don't accept UUIDs here.
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidV4.test(user_id)) {
    notFound();
  }

  const user = await getUserById(user_id);

  if (!user) {
    notFound();
  }

  // Check if viewing user is the current user
  const supabase = await createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isCurrentUser = authUser?.id === user.id;

  const [{ lists: createdLists, hasMore: createdHasMore }, { lists: savedLists, hasMore: savedHasMore }] =
    await Promise.all([
      getUserCreatedLists(user.id, 12, 0, isCurrentUser),
      getUserSavedLists(user.id, 12, 0),
    ]);

  return (
    <main className="pt-24 pb-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-neutral-800 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserAvatar
                src={user.avatar_url}
                alt={user.username}
                size="md"
              />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {isCurrentUser ? "My Lists" : `${user.username}'s Lists`}
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                  {isCurrentUser ? (
                    "Your personal movie collections"
                  ) : (
                    <>
                      Collections curated by{" "}
                      <Link
                        href={`/users/${user.username}`}
                        className="text-brand-400 hover:underline"
                      >
                        @{user.username}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lists Tabs */}
        <UserListsTabs
          username={user.username}
          userId={user.id}
          isCurrentUser={isCurrentUser}
          initialCreatedLists={createdLists}
          initialSavedLists={savedLists}
          initialCreatedHasMore={createdHasMore}
          initialSavedHasMore={savedHasMore}
        />
      </div>
    </main>
  );
}

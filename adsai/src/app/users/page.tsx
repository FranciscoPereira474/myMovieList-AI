import { createServerClient } from "@/lib/supabase/server-client";
import {
  getCurrentUser,
  getBatchFollowStatus,
  getUserFavorites,
} from "@/app/users/[username]/_lib/queries";
import { UserSearch } from "./_components/user-search";
import { UserCard } from "./_components/user-card";
import { Pagination } from "./_components/pagination";

// Number of users to display per page
const USERS_PER_PAGE = 12;

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

/**
 * Users Directory Page - Server Component
 * Displays a searchable, paginated directory of all users.
 * Implements server-side search and pagination using URL state.
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { q: query = "", page: pageParam = "1" } = await searchParams;

  // Parse page number and ensure it's valid
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);

  // Calculate pagination range for Supabase query
  const from = (currentPage - 1) * USERS_PER_PAGE;
  const to = from + USERS_PER_PAGE - 1;

  const supabase = await createServerClient();

  // Build query with optional search filter
  let queryBuilder = supabase
    .from("profiles")
    .select("id, username, avatar_url, bio", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply search filter if query exists
  if (query && query.trim()) {
    queryBuilder = queryBuilder.ilike("username", `%${query.trim()}%`);
  }

  // Apply pagination
  queryBuilder = queryBuilder.range(from, to);

  const { data: users, error, count } = await queryBuilder;

  // Handle query errors
  if (error) {
    console.error("Error fetching users:", error);
    return (
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-red-400">Failed to load users. Please try again.</p>
        </div>
      </main>
    );
  }

  const totalUsers = count || 0;
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  // Get current authenticated user for follow status
  const currentUser = await getCurrentUser();

  // Get all user IDs for batch operations
  const userIds = (users || []).map((u) => u.id);

  // Batch fetch follow status for all users at once (more efficient)
  const followStatusMap = currentUser
    ? await getBatchFollowStatus(currentUser.id, userIds)
    : new Map<string, boolean>();

  // Fetch favorites for each user
  const usersWithExtras = await Promise.all(
    (users || []).map(async (user) => {
      // Use centralized favorites query
      const favorites = await getUserFavorites(user.id, 3);

      return {
        ...user,
        favorites,
        isFollowing: followStatusMap.get(user.id) || false,
        isCurrentUser: currentUser?.id === user.id,
      };
    })
  );

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">
          Members{" "}
          <span className="text-neutral-500 text-lg font-normal ml-2">
            {totalUsers.toLocaleString()}
          </span>
        </h1>

        {/* Search Input - Client Component */}
        <UserSearch initialQuery={query} />
      </div>

      {/* Users Grid */}
      {usersWithExtras && usersWithExtras.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usersWithExtras.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                query={query}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-neutral-400 text-lg">
            {query ? `No users found matching "${query}"` : "No users found"}
          </p>
        </div>
      )}
    </main>
  );
}

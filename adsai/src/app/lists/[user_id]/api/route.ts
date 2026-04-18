import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  getUserCreatedLists,
  getUserSavedLists,
} from "../_lib/queries";
import { createServerClient } from "@/lib/supabase/server-client";

/**
 * * Retrieves a list of saved or created lists for the authenticated user.
 *  *
 *  * @param {NextRequest} request - The incoming HTTP request.
 *  * @param {{ params: Promise<{ user_id: string }> }} options - Options object containing the user ID parameter.
 *  * @returns {Promise<NextResponse>} A JSON response containing the list data and pagination metadata.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  const searchParams = request.nextUrl.searchParams;

  const type = searchParams.get("type") || "created";
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = 12;

  const user = await getUserById(user_id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (type === "saved") {
    const { lists, hasMore } = await getUserSavedLists(user.id, limit, offset);
    return NextResponse.json({ lists, hasMore });
  }

  // Determine if the requester is the list owner to include private lists
  const supabase = await createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const includePrivate = authUser?.id === user.id;

  const { lists, hasMore } = await getUserCreatedLists(user.id, limit, offset, includePrivate);
  return NextResponse.json({ lists, hasMore });
}

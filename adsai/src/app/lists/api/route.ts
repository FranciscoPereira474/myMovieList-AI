import { NextRequest, NextResponse } from "next/server";
import { getLists, type ListSortOption } from "../_lib/queries";

/**
 * * Handles GET requests to retrieve a list of items with pagination.
 *  *
 *  * @param {NextRequest} request - The incoming HTTP request.
 *  * @returns {Promise<NextResponse>} A JSON response containing the list of items and a boolean indicating whether there are more results.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const sort = (searchParams.get("sort") as ListSortOption) || "popular_week";

  const { lists, hasMore } = await getLists(12, offset, sort);

  return NextResponse.json({ lists, hasMore });
}

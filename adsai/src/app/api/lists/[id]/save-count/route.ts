import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * * Handles GET requests to retrieve the number of saves for a given list ID.
 *  *
 *  * @param _req - The incoming request object.
 *  * @param params - An object containing the list ID, which is resolved as a Promise.
 *  * @returns A JSON response with the count of saves or an error message.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // In Next.js app route handlers, dynamic `params` may be a Promise — await it.
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Supabase URL or SUPABASE_SERVICE_ROLE_KEY not configured");
    return NextResponse.json({ error: "Supabase URL or service role key not configured" }, { status: 500 });
  }

  const supabase = createClient(url, serviceRoleKey);

  try {
    const { count, error } = await supabase
      .from("list_saves")
      .select("*", { count: "exact", head: true })
      .eq("list_id", id);

    if (error) {
      console.error("Error fetching save count (service role):", error);
      return NextResponse.json({ error: error.message || "Supabase error" }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    console.error("Unexpected error fetching save count:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * * Handles a password reset request for an email address.
 *  *
 *  * @param {Request} request - The incoming HTTP request.
 *  * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 *  
 * export async function POST(request: Request) {
 *   try {
 *     const body = await request.json();
 *     const email = (body?.email || "").toString().trim();
 *
 *     if (!email) {
 *       return NextResponse.json({ error: "Email is required" }, { status: 400 });
 *     }
 *
 *     const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 *     const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 *
 *     if (!url || !anonKey) {
 *       console.error("Supabase URL or anon key not configured");
 *       return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
 *     }
 *
 *     const supabase = createClient(url, anonKey);
 *
 *     // Use the request origin as the redirect target for the password reset
 *     const origin = new URL(request.url).origin;
 *
 *     const { error } = await supabase.auth.resetPasswordForEmail(email, {
 *       redirectTo: `${origin}/reset-password`,
 *     });
 *
 *     if (error) {
 *       console.error("Error sending reset email:", error);
 *       // Don't reveal whether the email exists — return a generic success message
 *       return NextResponse.json({ ok: true });
 *     }
 *
 *     return NextResponse.json({ ok: true });
 *   } catch (err) {
 *     console.error("/api/auth/forgot error:", err);
 *     return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email || "").toString().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.error("Supabase URL or anon key not configured");
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, anonKey);

    // Use the request origin as the redirect target for the password reset
    const origin = new URL(request.url).origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      console.error("Error sending reset email:", error);
      // Don't reveal whether the email exists — return a generic success message
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/auth/forgot error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getMovieById } from "@/app/movies/[id]/_lib/queries";

/**
 * * Handles GET requests for a specific movie by slug.
 *  *
 *  * @param {Request} request - The incoming HTTP request.
 *  * @param {Object} props - Application properties, including the params object.
 *  * @param {Promise<Object>} props.params - A promise resolving to an object with a slug property.
 *  *
 *  * @returns {Response} A JSON response containing the movie data or an error message.
 */
export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const movie = await getMovieById(slug);
    return NextResponse.json(movie);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
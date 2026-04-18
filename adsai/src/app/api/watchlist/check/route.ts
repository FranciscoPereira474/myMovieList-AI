import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

/**
 * * Checks if a movie is in the user's watchlist.
 *  *
 *  * @param {Request} req - The incoming request object.
 *  * @returns {Promise<NextResponse>} A JSON response indicating whether the movie is in the watchlist or not.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const movieId = url.searchParams.get('movieId');
    if (!movieId) return NextResponse.json({ inWatchlist: false });

    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ inWatchlist: false });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('movie_id')
      .eq('movie_id', movieId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('watchlist check error', error);
      return NextResponse.json({ inWatchlist: false });
    }

    return NextResponse.json({ inWatchlist: !!data });
  } catch (err) {
    console.error('Unexpected error in watchlist check API:', err);
    return NextResponse.json({ inWatchlist: false });
  }
}

'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * * Creates a new browser client instance for the Supabase application.
 *  *
 *  * @param {string} supabaseUrl - The URL of the Supabase application.
 *  * @param {string} anonKey - The anonymous key for authentication.
 *  * @returns {object} A new browser client instance.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with service role privileges.
 * This bypasses RLS and should only be used for server-side read operations
 * where RLS would incorrectly block access to public data.
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

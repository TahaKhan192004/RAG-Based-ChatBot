import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  // Service role bypasses RLS. Keep this helper in server-only code and use it
  // only inside server components, route handlers, or server actions.
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function requireSupabaseServiceClient() {
  const client = getSupabaseServiceClient();

  if (!client) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return client;
}

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only client using the Supabase service role key.
 * This key BYPASSES Row Level Security and must never be sent to the
 * browser. It is only imported from Next.js Route Handlers
 * (app/api/**\/route.ts), which always run on the server.
 *
 * Used for:
 * - Verifying the Admin PIN against admin_settings (a table the anon
 *   key cannot read at all)
 * - Performing UPDATE/DELETE on payments after a valid PIN is supplied
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server. " +
        "Set SUPABASE_SERVICE_ROLE_KEY in your Vercel/Local env (never expose it with a NEXT_PUBLIC_ prefix)."
    );
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

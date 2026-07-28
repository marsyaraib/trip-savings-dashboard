"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill in your Supabase project credentials."
  );
}

/**
 * Browser client, safe to use in client components.
 * Uses the public anon key. Row Level Security policies (see
 * supabase/migrations/0001_init.sql) restrict what this key can do:
 * - payments: SELECT + INSERT only (no UPDATE/DELETE)
 * - activity_logs: SELECT + INSERT only
 * - admin_settings: no access at all
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Verifies an Admin PIN attempt against the hashed PIN via the verify_admin_pin RPC. */
export async function verifyPin(pin: unknown): Promise<boolean> {
  if (typeof pin !== "string" || pin.length === 0) return false;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("verify_admin_pin", { pin_attempt: pin });
  if (error) {
    console.error("PIN verification error:", error.message);
    return false;
  }
  return data === true;
}

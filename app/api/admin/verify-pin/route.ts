import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = body?.pin;

  if (typeof pin !== "string" || pin.length === 0) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("verify_admin_pin", { pin_attempt: pin });

  if (error) {
    console.error("PIN verification error:", error.message);
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid: data === true });
}

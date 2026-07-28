import { NextRequest, NextResponse } from "next/server";
import { verifyPin } from "@/lib/supabase/adminPin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = body?.pin;

  if (typeof pin !== "string" || pin.length === 0) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const isValid = await verifyPin(pin);
  return NextResponse.json({ valid: isValid });
}

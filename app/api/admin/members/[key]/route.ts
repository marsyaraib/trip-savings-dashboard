import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/supabase/adminPin";
import type { Database } from "@/lib/supabase/database.types";

type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const { pin, updates } = body as { pin?: string; updates?: Record<string, unknown> };

  const isValid = await verifyPin(pin);
  if (!isValid) {
    return NextResponse.json({ error: "PIN Admin salah." }, { status: 401 });
  }

  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "Data perubahan tidak valid." }, { status: 400 });
  }

  // Only display_name and photo_url are editable — key/color/initials never are.
  const allowedKeys = ["display_name", "photo_url"] as const;
  const safeUpdates: MemberUpdate = {};
  for (const k of allowedKeys) {
    if (k in updates) {
      (safeUpdates as Record<string, unknown>)[k] = updates[k];
    }
  }

  if (typeof safeUpdates.display_name === "string" && safeUpdates.display_name.trim().length === 0) {
    return NextResponse.json({ error: "Nama tampilan tidak boleh kosong." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("members").update(safeUpdates).eq("key", key).select().single();

  if (error) {
    return NextResponse.json({ error: `Gagal mengubah profil anggota: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ member: data });
}

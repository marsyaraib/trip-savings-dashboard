import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/supabase/adminPin";
import { paletteForIndex } from "@/constants/memberPalette";

function slugify(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "member";
}

function deriveInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const { pin, displayName, photoUrl } = body as { pin?: string; displayName?: string; photoUrl?: string | null };

  const isValid = await verifyPin(pin);
  if (!isValid) {
    return NextResponse.json({ error: "PIN Admin salah." }, { status: 401 });
  }

  if (typeof displayName !== "string" || displayName.trim().length === 0) {
    return NextResponse.json({ error: "Nama tampilan tidak boleh kosong." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: existing, error: fetchError } = await admin.from("members").select("key, sort_order");
  if (fetchError) {
    return NextResponse.json({ error: `Gagal membaca data anggota: ${fetchError.message}` }, { status: 500 });
  }

  const existingKeys = new Set((existing ?? []).map((m) => m.key));
  const baseKey = slugify(displayName);
  let key = baseKey;
  let suffix = 2;
  while (existingKeys.has(key)) {
    key = `${baseKey}-${suffix}`;
    suffix += 1;
  }

  const nextSortOrder = (existing?.length ?? 0);
  const palette = paletteForIndex(nextSortOrder);

  const { data, error } = await admin
    .from("members")
    .insert([
      {
        key,
        display_name: displayName.trim(),
        photo_url: photoUrl ?? null,
        initials: deriveInitials(displayName),
        color_class: palette.colorClass,
        ring_class: palette.ringClass,
        hex: palette.hex,
        sort_order: nextSortOrder,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: `Gagal menambahkan anggota: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ member: data });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

async function verifyPin(pin: unknown): Promise<boolean> {
  if (typeof pin !== "string" || pin.length === 0) return false;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("verify_admin_pin", { pin_attempt: pin });
  if (error) {
    console.error("PIN verification error:", error.message);
    return false;
  }
  return data === true;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  // Only allow a safe, known subset of columns to be edited.
  const allowedKeys = ["member_name", "payment_month", "payment_year", "payment_date", "amount", "note"] as const;
  const safeUpdates: PaymentUpdate = {};
  for (const key of allowedKeys) {
    if (key in updates) {
      (safeUpdates as Record<string, unknown>)[key] = updates[key];
    }
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("payments")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: `Gagal mengubah transaksi: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ payment: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { pin } = body as { pin?: string };

  const isValid = await verifyPin(pin);
  if (!isValid) {
    return NextResponse.json({ error: "PIN Admin salah." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("payments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: `Gagal menghapus transaksi: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

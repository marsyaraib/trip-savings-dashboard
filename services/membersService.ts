import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { Member } from "@/constants/members";
import { uploadMemberPhoto } from "@/services/storageService";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];

function rowToMember(row: MemberRow): Member {
  return {
    key: row.key,
    displayName: row.display_name,
    photoUrl: row.photo_url,
    initials: row.initials,
    colorClass: row.color_class,
    ringClass: row.ring_class,
    hex: row.hex,
  };
}

export async function fetchAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from("members").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat data anggota: ${error.message}`);
  return (data ?? []).map(rowToMember);
}

export interface AddMemberInput {
  pin: string;
  displayName: string;
  photoFile: File | null;
}

/** Adds a new member. The key is generated server-side from displayName. */
export async function addMember(input: AddMemberInput): Promise<Member> {
  let photoUrl: string | null = null;
  if (input.photoFile) {
    const tempFolder = `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    photoUrl = await uploadMemberPhoto(input.photoFile, tempFolder);
  }

  const res = await fetch("/api/admin/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: input.pin, displayName: input.displayName, photoUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal menambahkan anggota.");
  return rowToMember(json.member as MemberRow);
}

export interface EditMemberProfileInput {
  pin: string;
  displayName?: string;
  photoFile?: File | null;
}

/** Edits an existing member's display name and/or photo. The key never changes. */
export async function editMemberProfile(key: string, input: EditMemberProfileInput): Promise<Member> {
  const updates: Record<string, unknown> = {};
  if (input.displayName !== undefined) updates.display_name = input.displayName;
  if (input.photoFile) {
    updates.photo_url = await uploadMemberPhoto(input.photoFile, key);
  }

  const res = await fetch(`/api/admin/members/${key}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: input.pin, updates }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal mengubah profil anggota.");
  return rowToMember(json.member as MemberRow);
}

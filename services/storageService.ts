import { supabase } from "@/lib/supabase/client";

const BUCKET = "payment-proofs";
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

const MEMBER_PHOTO_BUCKET = "member-photos";
export const MAX_MEMBER_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_MEMBER_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export function validateProofFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return "Format file harus JPG, PNG, atau PDF.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Ukuran file maksimal 10 MB.";
  }
  return null;
}

export function validateMemberPhotoFile(file: File): string | null {
  if (!ACCEPTED_MEMBER_PHOTO_MIME_TYPES.includes(file.type)) {
    return "Format foto harus JPG, PNG, atau WEBP.";
  }
  if (file.size > MAX_MEMBER_PHOTO_SIZE_BYTES) {
    return "Ukuran foto maksimal 5 MB.";
  }
  return null;
}

/** Uploads a proof-of-transfer file and returns its public URL. */
export async function uploadProofFile(file: File, memberName: string): Promise<string> {
  const error = validateProofFile(file);
  if (error) throw new Error(error);

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${memberName}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Gagal mengunggah bukti transfer: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Uploads a member profile photo (keyed by the stable member key) and returns its public URL. */
export async function uploadMemberPhoto(file: File, memberKey: string): Promise<string> {
  const error = validateMemberPhotoFile(file);
  if (error) throw new Error(error);

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${memberKey}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(MEMBER_PHOTO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Gagal mengunggah foto profil: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(MEMBER_PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

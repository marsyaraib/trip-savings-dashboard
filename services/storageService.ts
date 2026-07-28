import { supabase } from "@/lib/supabase/client";

const BUCKET = "payment-proofs";
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

export function validateProofFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return "Format file harus JPG, PNG, atau PDF.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Ukuran file maksimal 10 MB.";
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

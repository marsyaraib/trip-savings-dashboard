"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateMemberPhotoFile } from "@/services/storageService";

interface UploadMemberPhotoProps {
  file: File | null;
  existingPhotoUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function UploadMemberPhoto({ file, existingPhotoUrl, onChange }: UploadMemberPhotoProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        setLocalError("Foto tidak valid. Gunakan JPG, PNG, atau WEBP maksimal 5 MB.");
        return;
      }
      const picked = accepted[0];
      if (!picked) return;
      const validationError = validateMemberPhotoFile(picked);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      setLocalError(null);
      onChange(picked);
    },
  });

  const shownUrl = previewUrl ?? existingPhotoUrl ?? null;

  return (
    <div className="flex items-center gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
          isDragActive
            ? "border-lacquer-500 bg-lacquer-50 dark:bg-lacquer-500/10"
            : "border-slate-200 hover:border-lacquer-400 dark:border-slate-800"
        )}
      >
        <input {...getInputProps()} />
        {shownUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownUrl} alt="Foto profil" className="h-full w-full object-cover" />
        ) : (
          <UploadCloud className="h-5 w-5 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {file ? file.name : "Klik atau seret foto ke sini (opsional)"}
        </p>
        <p className="text-xs text-slate-400">JPG, PNG, atau WEBP &middot; maksimal 5 MB</p>
        {localError && <p className="mt-1 text-xs text-red-500">{localError}</p>}
      </div>
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

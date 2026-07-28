"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, FileText, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateProofFile } from "@/services/storageService";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface UploadProofProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
}

export function UploadProof({ file, onChange, error }: UploadProofProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "application/pdf": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        setLocalError("File tidak valid. Gunakan JPG, PNG, atau PDF maksimal 10 MB.");
        return;
      }
      const picked = accepted[0];
      if (!picked) return;
      const validationError = validateProofFile(picked);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      setLocalError(null);
      onChange(picked);
    },
  });

  const displayError = error ?? localError;

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        {previewUrl ? (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview bukti transfer" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomIn className="h-4 w-4 text-white" />
            </span>
          </button>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
          <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>

        {previewUrl && (
          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
            <DialogContent className="max-w-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Bukti transfer" className="w-full rounded-xl" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragActive
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
            : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-6 w-6 text-slate-400" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {isDragActive ? "Lepas file di sini" : "Klik atau seret bukti transfer ke sini"}
        </p>
        <p className="text-xs text-slate-400">JPG, PNG, atau PDF &middot; maksimal 10 MB</p>
      </div>
      {displayError && <p className="mt-1.5 text-xs text-red-500">{displayError}</p>}
    </div>
  );
}

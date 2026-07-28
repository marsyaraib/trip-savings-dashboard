"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadMemberPhoto } from "@/components/members/UploadMemberPhoto";
import { addMember, editMemberProfile } from "@/services/membersService";
import type { Member } from "@/constants/members";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MemberFormDialogProps {
  mode: "add" | "edit";
  member: Member | null; // required when mode === "edit"
  pin: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function MemberFormDialog({ mode, member, pin, onOpenChange, onSaved }: MemberFormDialogProps) {
  const [displayName, setDisplayName] = React.useState("");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);

  const open = mode === "add" ? pin !== null : !!member && pin !== null;

  React.useEffect(() => {
    if (open) {
      setDisplayName(mode === "edit" ? member?.displayName ?? "" : "");
      setPhotoFile(null);
    }
  }, [open, mode, member]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    if (displayName.trim().length === 0) {
      toast.error("Nama tampilan tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "add") {
        await addMember({ pin, displayName, photoFile });
        toast.success("Anggota baru berhasil ditambahkan.");
      } else if (member) {
        await editMemberProfile(member.key, { pin, displayName, photoFile });
        toast.success("Profil anggota berhasil diubah.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan profil anggota.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Tambah Anggota" : "Ubah Profil Anggota"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Anggota baru bisa langsung dipilih saat menambah pembayaran."
              : "Nama dan foto bisa diubah kapan saja. Identitas transaksi lama tetap tersimpan dengan benar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Tampilan</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Contoh: Fafa"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Foto Profil</Label>
            <UploadMemberPhoto
              file={photoFile}
              existingPhotoUrl={mode === "edit" ? member?.photoUrl : null}
              onChange={setPhotoFile}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Tambah Anggota" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

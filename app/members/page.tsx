"use client";

import * as React from "react";
import { UserPlus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PinDialog } from "@/components/transactions/PinDialog";
import { MemberFormDialog } from "@/components/members/MemberFormDialog";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { useSavingsData } from "@/hooks/useSavingsData";
import type { Member } from "@/constants/members";
import { toast } from "sonner";

type PendingAction = { type: "add" } | { type: "edit"; member: Member } | null;

export default function MembersPage() {
  const { members, isLoading, refetch } = useSavingsData();

  const [pending, setPending] = React.useState<PendingAction>(null);
  const [pinLoading, setPinLoading] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [formMember, setFormMember] = React.useState<Member | null>(null);
  const [formPin, setFormPin] = React.useState<string | null>(null);

  if (isLoading) return <DashboardSkeleton />;

  async function handlePinSubmit(pin: string) {
    if (!pending) return;
    setPinLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();

      if (!json.valid) {
        toast.error("PIN Admin salah.");
        setPinLoading(false);
        return;
      }

      if (pending.type === "add") {
        setFormMode("add");
        setFormMember(null);
      } else {
        setFormMode("edit");
        setFormMember(pending.member);
      }
      setFormPin(pin);
      setPending(null);
    } catch {
      toast.error("Gagal memverifikasi PIN. Coba lagi.");
    } finally {
      setPinLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Kelola Anggota</h1>
        <Button onClick={() => setPending({ type: "add" })}>
          <UserPlus className="h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <Card key={m.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar className="h-12 w-12">
                {m.photoUrl && <AvatarImage src={m.photoUrl} alt={m.displayName} />}
                <AvatarFallback className={m.colorClass}>{m.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{m.displayName}</p>
              </div>
              <button
                onClick={() => setPending({ type: "edit", member: m })}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-lacquer-600 dark:hover:bg-slate-800"
                aria-label={`Ubah profil ${m.displayName}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PinDialog
        open={!!pending}
        loading={pinLoading}
        title={pending?.type === "add" ? "Masukkan PIN untuk Menambah Anggota" : "Masukkan PIN untuk Mengubah Profil"}
        onOpenChange={(open) => !open && setPending(null)}
        onSubmit={handlePinSubmit}
      />

      <MemberFormDialog
        mode={formMode}
        member={formMember}
        pin={formPin}
        onOpenChange={(open) => !open && setFormPin(null)}
        onSaved={() => {
          setFormPin(null);
          refetch();
        }}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Trash2, FileText, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PinDialog } from "@/components/transactions/PinDialog";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { formatCurrency, formatDateID, monthNameID } from "@/lib/utils";
import { getMember } from "@/constants/members";
import { deletePayment } from "@/services/paymentsService";
import { useSavingsData } from "@/hooks/useSavingsData";
import type { Payment, PaginationFilter } from "@/types";
import { toast } from "sonner";

const UNDO_WINDOW_MS = 30_000;

interface TransactionHistoryTableProps {
  payments: Payment[];
  filter: PaginationFilter;
}

type PendingAction = { type: "edit" | "delete"; payment: Payment } | null;

export function TransactionHistoryTable({ payments, filter }: TransactionHistoryTableProps) {
  const { members, refetch, applyOptimisticDelete, applyOptimisticRestore } = useSavingsData();

  const [pending, setPending] = React.useState<PendingAction>(null);
  const [pinLoading, setPinLoading] = React.useState(false);
  const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null);
  const [editingPin, setEditingPin] = React.useState<string | null>(null);
  const pendingDeleteTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const filtered = payments.filter((p) => {
    if (filter.memberName && filter.memberName !== "all" && p.member_name !== filter.memberName) return false;
    if (filter.month && filter.month !== "all" && p.payment_month !== filter.month) return false;
    if (filter.year && filter.year !== "all" && p.payment_year !== filter.year) return false;
    if (filter.query && !(p.note ?? "").toLowerCase().includes(filter.query.toLowerCase())) return false;
    return true;
  });

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

      if (pending.type === "edit") {
        setEditingPayment(pending.payment);
        setEditingPin(pin);
      } else {
        scheduleDelete(pending.payment, pin);
      }
      setPending(null);
    } catch {
      toast.error("Gagal memverifikasi PIN. Coba lagi.");
    } finally {
      setPinLoading(false);
    }
  }

  function scheduleDelete(payment: Payment, pin: string) {
    applyOptimisticDelete(payment.id);

    const timer = setTimeout(async () => {
      pendingDeleteTimers.current.delete(payment.id);
      try {
        await deletePayment(payment.id, pin);
        await refetch();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menghapus transaksi.");
        applyOptimisticRestore(payment);
      }
    }, UNDO_WINDOW_MS);

    pendingDeleteTimers.current.set(payment.id, timer);

    toast("Transaksi dihapus", {
      description: `${getMember(members, payment.member_name)?.displayName ?? payment.member_name} · ${formatCurrency(payment.amount)}`,
      duration: UNDO_WINDOW_MS,
      action: {
        label: "Undo",
        onClick: () => {
          const t = pendingDeleteTimers.current.get(payment.id);
          if (t) {
            clearTimeout(t);
            pendingDeleteTimers.current.delete(payment.id);
          }
          applyOptimisticRestore(payment);
          toast.success("Transaksi dikembalikan.");
        },
      },
    });
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Tidak ada transaksi"
        description="Belum ada transaksi yang cocok dengan filter ini."
      />
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {filtered.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`font-semibold bg-gradient-to-br ${getMember(members, p.member_name)?.colorClass} bg-clip-text text-transparent`}
                  >
                    {getMember(members, p.member_name)?.displayName ?? p.member_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateID(p.payment_date)} &middot; {monthNameID(p.payment_month)} {p.payment_year}
                  </p>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(p.amount)}</p>
              </div>
              {p.note && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{p.note}</p>}
              <div className="mt-3 flex items-center justify-between">
                <ProofLink url={p.proof_image_url} />
                <RowActions
                  onEdit={() => setPending({ type: "edit", payment: p })}
                  onDelete={() => setPending({ type: "delete", payment: p })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Bulan</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium">Bukti</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 dark:border-slate-900">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateID(p.payment_date)}</td>
                  <td
                    className={`px-4 py-3 font-medium bg-gradient-to-br ${getMember(members, p.member_name)?.colorClass} bg-clip-text text-transparent`}
                  >
                    {getMember(members, p.member_name)?.displayName ?? p.member_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {monthNameID(p.payment_month)} {p.payment_year}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-500 dark:text-slate-400">
                    {p.note ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ProofLink url={p.proof_image_url} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      align="right"
                      onEdit={() => setPending({ type: "edit", payment: p })}
                      onDelete={() => setPending({ type: "delete", payment: p })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PinDialog
        open={!!pending}
        loading={pinLoading}
        title={pending?.type === "edit" ? "Masukkan PIN untuk Mengubah" : "Masukkan PIN untuk Menghapus"}
        onOpenChange={(open) => !open && setPending(null)}
        onSubmit={handlePinSubmit}
      />

      <EditTransactionDialog
        payment={editingPayment}
        pin={editingPin}
        onOpenChange={(open) => !open && setEditingPayment(null)}
        onSaved={() => {
          setEditingPayment(null);
          refetch();
        }}
      />
    </>
  );
}

function ProofLink({ url }: { url: string | null }) {
  if (!url) {
    return <ImageOff className="h-4 w-4 text-slate-300 dark:text-slate-700" />;
  }
  const isImage = /\.(jpe?g|png)$/i.test(url) || !url.toLowerCase().includes(".pdf");
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block">
      {isImage ? (
        <Image
          src={url}
          alt="Bukti transfer"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          unoptimized
        />
      ) : (
        <FileText className="h-5 w-5 text-lacquer-600" />
      )}
    </a>
  );
}

function RowActions({
  onEdit,
  onDelete,
  align = "left",
}: {
  onEdit: () => void;
  onDelete: () => void;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
      <button
        onClick={onEdit}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-lacquer-600 dark:hover:bg-slate-800"
        aria-label="Ubah transaksi"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        aria-label="Hapus transaksi"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

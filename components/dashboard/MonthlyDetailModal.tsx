"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAllMemberSummariesForMonth } from "@/utils/calculations";
import { formatCurrency, monthNameID } from "@/lib/utils";
import { getMember } from "@/constants/members";
import type { Payment } from "@/types";
import type { MonthYear } from "@/constants/savings";

interface MonthlyDetailModalProps {
  monthYear: MonthYear | null;
  payments: Payment[];
  onOpenChange: (open: boolean) => void;
}

export function MonthlyDetailModal({ monthYear, payments, onOpenChange }: MonthlyDetailModalProps) {
  const summaries = monthYear
    ? getAllMemberSummariesForMonth(payments, monthYear.month, monthYear.year)
    : [];

  return (
    <Dialog open={!!monthYear} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {monthYear ? `${monthNameID(monthYear.month)} ${monthYear.year}` : ""}
          </DialogTitle>
          <DialogDescription>Rincian pembayaran setiap anggota pada bulan ini.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {summaries.map((s) => {
            const member = getMember(s.member_name);
            return (
              <div
                key={s.member_name}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
              >
                <div>
                  <p className={`font-medium bg-gradient-to-br ${member?.colorClass} bg-clip-text text-transparent`}>
                    {s.member_name}
                  </p>
                  <p className="text-xs text-slate-400">{s.transactionCount} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(s.totalPaid)}
                  </p>
                  <p className="text-xs">
                    {s.status === "complete" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✔ Lunas</span>
                    ) : s.status === "in_progress" ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        Kurang {formatCurrency(s.remaining)}
                      </span>
                    ) : (
                      <span className="text-red-500">Belum bayar</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

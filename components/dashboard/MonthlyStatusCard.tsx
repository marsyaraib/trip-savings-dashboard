"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMemberSummariesForMonth } from "@/utils/calculations";
import { cn, monthNameID, formatCurrencyCompact } from "@/lib/utils";
import { getCurrentMonthYear } from "@/constants/savings";
import type { Payment } from "@/types";
import { getMember, type Member } from "@/constants/members";

const STATUS_META = {
  complete: {
    icon: "✔",
    label: "Lunas",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  },
  in_progress: {
    icon: "⏳",
    label: "Kurang",
    className:
      "bg-lacquer-50 text-lacquer-700 border-lacquer-200 dark:bg-lacquer-500/10 dark:text-lacquer-400 dark:border-lacquer-500/30",
  },
  empty: {
    icon: "✕",
    label: "Belum Bayar",
    className:
      "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800",
  },
} as const;

export function MonthlyStatusCard({ payments, members }: { payments: Payment[]; members: Member[] }) {
  const { month, year } = getCurrentMonthYear();
  const memberKeys = members.map((m) => m.key);
  const summaries = getAllMemberSummariesForMonth(payments, memberKeys, month, year);
  const allComplete = summaries.length > 0 && summaries.every((s) => s.status === "complete");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Status Bulan Ini &middot; {monthNameID(month)} {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaries.map((s) => {
            const member = getMember(members, s.member_name);
            const meta = STATUS_META[s.status];
            return (
              <div
                key={s.member_name}
                className={cn("flex flex-col items-center gap-2 rounded-xl border px-3 py-3", meta.className)}
              >
                <span className={`text-xs font-medium bg-gradient-to-br ${member?.colorClass} bg-clip-text text-transparent`}>
                  {member?.displayName ?? s.member_name}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <span>{meta.icon}</span>
                  {s.status === "in_progress" ? `Kurang ${formatCurrencyCompact(s.remaining)}` : meta.label}
                </span>
              </div>
            );
          })}
        </div>

        {allComplete && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            🎉 Semua anggota telah menyelesaikan target bulan ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

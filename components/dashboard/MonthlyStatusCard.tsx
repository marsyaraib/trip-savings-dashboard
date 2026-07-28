"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMemberSummariesForMonth } from "@/utils/calculations";
import { monthNameID } from "@/lib/utils";
import { getCurrentMonthYear } from "@/constants/savings";
import type { Payment } from "@/types";
import { getMember } from "@/constants/members";

const STATUS_ICON = { complete: "✔️", in_progress: "⏳", empty: "❌" } as const;

export function MonthlyStatusCard({ payments }: { payments: Payment[] }) {
  const { month, year } = getCurrentMonthYear();
  const summaries = getAllMemberSummariesForMonth(payments, month, year);
  const allComplete = summaries.every((s) => s.status === "complete");

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
            const member = getMember(s.member_name);
            return (
              <div
                key={s.member_name}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <span className={`text-xs font-medium bg-gradient-to-br ${member?.colorClass} bg-clip-text text-transparent`}>
                  {s.member_name}
                </span>
                <span className="text-lg">{STATUS_ICON[s.status]}</span>
              </div>
            );
          })}
        </div>

        {allComplete && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            🎉 Semua anggota telah menyelesaikan target bulan ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

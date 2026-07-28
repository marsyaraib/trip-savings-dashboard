"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProgramMonths, type MonthYear } from "@/constants/savings";
import { isMonthFullyComplete, getAllMemberSummariesForMonth } from "@/utils/calculations";
import { MONTH_NAMES_SHORT_EN } from "@/constants/savings";
import { cn } from "@/lib/utils";
import { MonthlyDetailModal } from "@/components/dashboard/MonthlyDetailModal";
import type { Payment } from "@/types";
import type { Member } from "@/constants/members";

const STATUS_STYLE = {
  complete: "bg-emerald-500 text-white border-emerald-500",
  in_progress: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  empty: "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800",
} as const;

function getMonthStatus(payments: Payment[], memberKeys: string[], my: MonthYear): keyof typeof STATUS_STYLE {
  if (isMonthFullyComplete(payments, memberKeys, my.month, my.year)) return "complete";
  const summaries = getAllMemberSummariesForMonth(payments, memberKeys, my.month, my.year);
  const anyProgress = summaries.some((s) => s.totalPaid > 0);
  return anyProgress ? "in_progress" : "empty";
}

export function MonthlyTimeline({ payments, members }: { payments: Payment[]; members: Member[] }) {
  const months = getAllProgramMonths();
  const memberKeys = members.map((m) => m.key);
  const [selected, setSelected] = React.useState<MonthYear | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-10">
          {months.map((my) => {
            const status = getMonthStatus(payments, memberKeys, my);
            return (
              <button
                key={`${my.year}-${my.month}`}
                onClick={() => setSelected(my)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-transform hover:scale-105 active:scale-95",
                  STATUS_STYLE[status]
                )}
              >
                <span>{MONTH_NAMES_SHORT_EN[my.month - 1]}</span>
                <span className="text-[10px] opacity-80">{String(my.year).slice(2)}</span>
                <span>{status === "complete" ? "✔" : status === "in_progress" ? "⏳" : "❌"}</span>
              </button>
            );
          })}
        </div>
      </CardContent>

      <MonthlyDetailModal
        monthYear={selected}
        payments={payments}
        members={members}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </Card>
  );
}

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProgramMonths, type MonthYear } from "@/constants/savings";
import { getAllMemberSummariesForMonth } from "@/utils/calculations";
import { MONTH_NAMES_SHORT_EN } from "@/constants/savings";
import { cn } from "@/lib/utils";
import { MonthlyDetailModal } from "@/components/dashboard/MonthlyDetailModal";
import type { Payment } from "@/types";
import type { Member } from "@/constants/members";

const STATUS_STYLE = {
  complete: "bg-amber-500 text-white border-amber-500",
  in_progress: "bg-lacquer-50 text-lacquer-700 border-lacquer-200 dark:bg-lacquer-500/10 dark:text-lacquer-400 dark:border-lacquer-500/30",
  empty: "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800",
} as const;

function getMonthProgress(payments: Payment[], memberKeys: string[], my: MonthYear) {
  const summaries = getAllMemberSummariesForMonth(payments, memberKeys, my.month, my.year);
  const completed = summaries.filter((s) => s.status === "complete").length;
  const total = memberKeys.length;
  const status: keyof typeof STATUS_STYLE =
    total > 0 && completed === total ? "complete" : summaries.some((s) => s.totalPaid > 0) ? "in_progress" : "empty";
  return { completed, total, status };
}

/** Small ring gauge showing how many of the group have hit target this month. */
function MonthRing({ completed, total }: { completed: number; total: number }) {
  const size = 30;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const dash = circumference * pct;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-current opacity-25" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="stroke-current"
        />
      </svg>
      <span className="absolute text-[9px] font-bold tabular-nums">
        {completed}/{total}
      </span>
    </div>
  );
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
            const { completed, total, status } = getMonthProgress(payments, memberKeys, my);
            return (
              <button
                key={`${my.year}-${my.month}`}
                onClick={() => setSelected(my)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-transform hover:scale-105 active:scale-95",
                  STATUS_STYLE[status]
                )}
              >
                <span>{MONTH_NAMES_SHORT_EN[my.month - 1]}</span>
                <span className="text-[10px] opacity-80">{String(my.year).slice(2)}</span>
                <MonthRing completed={completed} total={total} />
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

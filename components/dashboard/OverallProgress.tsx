"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, clampPercentage } from "@/lib/utils";
import type { Payment } from "@/types";
import { sumPayments } from "@/utils/calculations";

export function OverallProgress({ payments, targetGroup }: { payments: Payment[]; targetGroup: number }) {
  const collected = sumPayments(payments);
  const remaining = Math.max(0, targetGroup - collected);
  const percentage = targetGroup > 0 ? clampPercentage((collected / targetGroup) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Kelompok</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-end justify-between">
          <motion.span
            key={collected}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50 md:text-3xl"
          >
            {formatCurrency(collected)}
          </motion.span>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <Progress value={percentage} className="h-4" />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Target</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(targetGroup)}
            </p>
          </div>
          <div className="border-x border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Terkumpul</p>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {formatCurrency(collected)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Sisa</p>
            <p className="text-sm font-semibold text-lacquer-600 dark:text-lacquer-400">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

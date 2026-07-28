"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProgramMonths } from "@/constants/savings";
import { MONTH_NAMES_SHORT_EN } from "@/constants/savings";
import { formatCurrencyCompact, formatCurrency } from "@/lib/utils";
import { sumPayments } from "@/utils/calculations";
import type { Payment } from "@/types";

export function MonthlySavingsChart({ payments }: { payments: Payment[] }) {
  const data = getAllProgramMonths().map((my) => ({
    label: `${MONTH_NAMES_SHORT_EN[my.month - 1]} '${String(my.year).slice(2)}`,
    total: sumPayments(payments.filter((p) => p.payment_month === my.month && p.payment_year === my.year)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Tabungan per Bulan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -12, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} interval={2} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} width={56} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

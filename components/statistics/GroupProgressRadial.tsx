"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TARGET_GROUP } from "@/constants/savings";
import { formatCurrency, clampPercentage } from "@/lib/utils";
import { sumPayments } from "@/utils/calculations";
import type { Payment } from "@/types";

export function GroupProgressRadial({ payments }: { payments: Payment[] }) {
  const collected = sumPayments(payments);
  const percentage = clampPercentage((collected / TARGET_GROUP) * 100);
  const data = [{ name: "progress", value: percentage, fill: "#10b981" }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Menuju Rp40.000.000</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              startAngle={90}
              endAngle={-270}
              innerRadius="72%"
              outerRadius="100%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" cornerRadius={999} background={{ fill: "#f1f5f9" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {percentage.toFixed(1)}%
            </span>
            <span className="mt-1 text-xs text-slate-400">{formatCurrency(collected)}</span>
            <span className="text-[11px] text-slate-400">dari {formatCurrency(TARGET_GROUP)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

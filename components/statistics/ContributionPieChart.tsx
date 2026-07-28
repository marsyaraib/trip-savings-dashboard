"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERS } from "@/constants/members";
import { formatCurrency } from "@/lib/utils";
import { totalByMember } from "@/utils/calculations";
import type { Payment } from "@/types";

export function ContributionPieChart({ payments }: { payments: Payment[] }) {
  const data = MEMBERS.map((m) => ({
    name: m.name,
    value: totalByMember(payments, m.name),
    fill: m.hex,
  })).filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persentase Kontribusi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Belum ada data tabungan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
